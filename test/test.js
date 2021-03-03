var tape = require("..")

var biiko
var incrementer
// initial value ~ constructor arg for the incrementer contract
var initValue = 419n

tape("creatin an account", async t => {
  biiko = t.keygen()

  t.true(/^0x[0-9a-fA-F]{40}$/.test(biiko.address), "biiko address")
  t.true(/^0x[0-9a-fA-F]{64}$/.test(biiko.privateKey), "biiko secret")

  var balance = await t.balance(biiko.address)

  t.equal(balance, 0n, "init balance zero")
})

tape("fundin biiko", async function (t) {
  var balance = await t.balance(biiko.address)
  var fundin = t.toWei("100", "ether")
  var expected = balance + fundin

  await t.fund(biiko.address, fundin)

  balance = await t.balance(biiko.address)

  t.equal(balance, expected, "funded balance")
})

tape("transferin 2 biiko", async t => {
  var balance = await t.balance(biiko.address)
  var fundin = t.toWei("100", "ether")
  var expected = balance + fundin

  var receipt = await t.transfer(
    biiko.address, fundin,
    tape.GENESIS.privateKey
  )

  t.true(/^0x[0-9a-fA-F]{64}$/.test(receipt.transactionHash), "receipt tx hash")

  balance = await t.balance(biiko.address)

  t.equal(balance, expected, "topd up balance")
})

tape("deployin the incrementer contract", async t => {
  // compilin a solidity contract with solc
  // the 2nd arg are options
  //   opts.initParams to pass constructor args
  //   opts.noCache to bypass the compilation cache & force recompilation
  var artifacts = await t.compile(require.resolve("./Incrementer.sol"), {
    // init params are passed to the contract contructor at instantiation
    initParams: { types: ["uint256"], values: [initValue] },
    noCache: false
  })

  // deployin a contract on the local dev net
  // the 2nd optional arg are options { from, value, gasPrice, gas }
  // the 3rd optional arg is the signing private key
  incrementer = await t.deploy(artifacts)

  // t.deploy returns contracts with the ".options.address" prop set always
  t.true(
    /^0x[0-9a-fA-F]{40}$/.test(incrementer.options.address),
    "incrementer contract address"
  )
})

tape("interactin with the incrementer contract", async t => {
  // accessing a getter
  // the 2nd arg is the prop name
  // the 3rd optional arg can be a function to use as value parser
  num = await t.get(incrementer, "number", BigInt)

  t.equal(num, initValue, "num equals init value")

  // invoking a contract method with arguments
  // the 3rd optional arg can be a single value, or an array
  await t.invoke(incrementer, "increment", 1n)

  // accessing a getter - again
  num = await t.get(incrementer, "number", BigInt)

  t.equal(num, initValue + 1n, "num equals init value+1")

  // calling a contract method with no args
  await t.invoke(incrementer, "reset")

  // accessing a getter ...
  num = await t.get(incrementer, "number", BigInt)

  t.equal(num, 0n, "num equals zero")
})

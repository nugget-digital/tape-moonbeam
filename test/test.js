var tape = require("..")
var methid = require("methid")

var biiko

tape("creatin an account", async t => {
  biiko = t.keygen()

  t.truthy(biiko.address)
  t.truthy(biiko.privateKey)

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
    { to: biiko.address, value: fundin },
    tape.GENESIS.privateKey
  )

  t.true(/^0x[0-9a-fA-F]{64}$/.test(receipt.transactionHash), "receipt tx hash")

  balance = await t.balance(biiko.address)

  t.equal(balance, expected, "topd up balance")
})

tape("deployin & interactin with the incrementer contract", async t => {
  var initValue = 419n

  // compilin a solidity contract with solc
  var artifacts = await t.compile(require.resolve("./Incrementer.sol"), {
    initParams: { types: ["uint256"], values: [initValue] }
  })

  // deployin a contract on the local dev net
  var contract = await t.deploy(artifacts)

  t.true(
    /^0x[0-9a-fA-F]{40}$/.test(contract.options.address),
    "contract address"
  )

  // take this as a getter for the incrementer's uint256 public number
  var num = BigInt(await contract.methods.number().call())

  t.equal(num, initValue, "num equals init value")

  // take this as a contract call incl data implying state changes
  var tx = await t.send(
    {
      to: contract.options.address,
      data:
        methid("increment(uint256)") +
        "0000000000000000000000000000000000000000000000000000000000000001"
    },
    tape.GENESIS.privateKey
  )

  await t.mined(tx)

  num = BigInt(await contract.methods.number().call())

  t.equal(num, initValue + 1n, "num equals init value+1")

  // take this as a void contract call implying state changes
  tx = await t.send(
    {
      to: contract.options.address,
      data: methid("reset()")
    },
    tape.GENESIS.privateKey
  )

  await t.mined(tx)

  num = BigInt(await contract.methods.number().call())

  t.equal(num, 0n, "num equals zero")
})

var tape = require("..")
var methid = require("methid")

tape("alice transfers into the void", async t => {
  var tx = await t.web3.eth.accounts.signTransaction(
    {
      from: t.genesis.address,
      to: "0x44236223aB4291b93EEd10E4B511B37a398DEE55",
      value: t.web3.utils.toWei("100", "ether"),
      gas: 21000
    },
    t.genesis.privateKey
  )

  var receipt = await t.mined(tx)

  t.true(/^0x[0-9a-fA-F]{64}$/.test(receipt.transactionHash), "receipt tx hash")
})

tape("deployin & interactin with the incrementer contract", async t => {
  var initValue = 0x1a3

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
  var num = Number(await contract.methods.number().call())

  t.equal(num, initValue, "num equals init value")

  // take this as a contract call incl data implying state changes
  var tx = await t.send(
    {
      to: contract.options.address,
      data:
        methid("increment(uint256)") +
        "0000000000000000000000000000000000000000000000000000000000000001"
    },
    t.genesis.privateKey
  )

  await t.mined(tx)

  num = Number(await contract.methods.number().call())

  t.equal(num, initValue + 1, "num equals init value+1")

  // take this as a void contract call implying state changes
  tx = await t.send(
    {
      to: contract.options.address,
      data: methid("reset()")
    },
    t.genesis.privateKey
  )

  await t.mined(tx)

  num = Number(await contract.methods.number().call())

  t.equal(num, 0, "num equals zero")
})

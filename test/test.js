var tape = require("..")

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

  var artifact = await t.compile(require.resolve("./Incrementer.sol"), {
    initParams: { types: ["uint256"], values: [initValue] }
  })

  var contract = await t.deploy(artifact)

  t.true(
    /^0x[0-9a-fA-F]{40}$/.test(contract.options.address),
    "contract address"
  )

  var num = Number(await contract.methods.number().call())

  t.equal(num, initValue, "num equals init value")

  // TODO increment

  // num = Number(await contract.methods.number().call())

  // t.equal(num, initValue+1, "num equals init value+1")

  // TODO reset

  // num = Number(await contract.methods.number().call())

  // t.equal(num, 0, "num equals zero")
})

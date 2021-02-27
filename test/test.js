var test = require("..")

test("alice transfers to bob", async t => {
  var privKey =
    "99b3c12287537e38c90a9219d4cb074a89a16e9cdb20bf85728ebd97c343e342" // Genesis private key
  var addressFrom = "0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b"
  var addressTo = "0x44236223aB4291b93EEd10E4B511B37a398DEE55" // Change addressTo

  var tx = await t.web3.eth.accounts.signTransaction(
    {
      from: addressFrom,
      to: addressTo,
      value: t.web3.utils.toWei("100", "ether"),
      gas: 21000
    },
    privKey
  )

  var receipt = await t.web3.eth.sendSignedTransaction(tx.rawTransaction)

  t.ok(receipt.transactionHash)

  t.end()
})

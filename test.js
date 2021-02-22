const test = require('.')

test('alice transfers to bob', async t => {
  const unsub = await t.api.tx.balances
    .transfer(t.bob.address, 12345)
    .signAndSend(t.alice, result => {
      t.comment(`current status is ${result.status}`)

      if (result.status.isInBlock) {
        t.comment(`Transaction included at blockHash ${result.status.asInBlock}`)
      } else if (result.status.isFinalized) {
        t.comment(`Transaction finalized at blockHash ${result.status.asFinalized}`)
        unsub()
        t.pass()
        t.end()
      }
    })
})

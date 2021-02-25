var MoonbeamDevNode = require("./node.js")
var connect = require("./connect.js")

module.exports = async function (fn, opts) {
  var p = new MoonbeamDevNode(opts)

  process.once("SIGINT", stop)
  process.once("SIGTERM", stop)
  process.once("uncaughtException", stop)
  process.once("unhandledRejection", stop)

  p.on("log", () => {})

  await p.started

  var web3 = connect(opts)

  await fn(web3)

  await stop()

  async function stop(ex) {
    if (ex) console.error(ex)
    p.kill()
    await p.stopped
  }
}

var MoonbeamDevNode = require("./node.js")
var connect = require("./connect")

module.exports = async function (fn, opts) {
  var p = new MoonbeamDevNode(opts)

  process.once("SIGINT", stop)
  process.once("SIGTERM", stop)
  process.once("uncaughtException", stop)
  process.once("unhandledRejection", stop)

  // p.on("log", console.log)

  await p.started

  console.log("p.started", p.started)
  console.log("opts", opts)

  var clients = await connect(opts)

  await fn(clients)

  await stop()

  async function stop(ex) {
    if (ex) console.error(ex)
    p.kill()
    await p.stopped
  }
}

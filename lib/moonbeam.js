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

  await fn(await connect(opts.wsPort))

  await stop()

  async function stop(ex) {
    if (ex) console.error(ex)
    p.kill()
    await p.stopped
  }
}

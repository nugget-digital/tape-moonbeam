var MoonbeamDevNode = require("./node.js")
var Nanoeth = require('nanoeth/http')

module.exports = async function (fn, opts) {
  var p = new MoonbeamDevNode(opts)

  process.once("SIGINT", stop)
  process.once("SIGTERM", stop)
  process.once("uncaughtException", stop)
  process.once("unhandledRejection", stop)

  // p.on("log", console.log)

  await p.started

  var eth = new Nanoeth(opts.nodeUrl || "http://localhost:9933")

  await fn(eth)

  await stop()

  async function stop(ex) {
    if (ex) console.error(ex)
    p.kill()
    await p.stopped
  }
}

const fs = require("fs")
const path = require("path")
const tape = require("tape")
const EventEmitter = require("events")

const Result = require("tape/lib/results")

const duplexify = require("duplexify")
const moonbeam = require("./lib/moonbeam")

let customTypes
let exec

if (fs.existsSync("./.tape-moonbeam.json")) {
  const config = require("./.tape-moonbeam.json")
  customTypes = config.CUSTOM_TYPES || {}
  exec = config.NODE_EXEC || path.resolve(__dirname, "./moonbeam")
} else {
  customTypes = {}
  exec = path.resolve(__dirname, "./moonbeam") // TODO require('../moonbeam-binary')
}

const _createStream = Result.prototype.createStream

Result.prototype.createStream = function (...args) {
  const s = duplexify()

  const opts = { exec, customTypes }

  moonbeam(async web3 => {
    tape.Test.prototype.web3 = web3

    const ts = _createStream.call(this, ...args)
    s.setReadable(ts)

    await Promise.race([
      EventEmitter.once(this, "done"),
      EventEmitter.once(this, "fail")
    ])
  }, opts).catch(e => s.destroy(e))

  return s
}

module.exports = tape

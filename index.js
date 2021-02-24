var fs = require("fs")
var EventEmitter = require("events")
var duplexify = require("duplexify")
var tape = require("tape")
var Result = require("tape/lib/results")
var moonbeam = require("./lib/moonbeam")

let customTypes
let exec

if (fs.existsSync("./.tape-moonbeam.json")) {
  var config = require("./.tape-moonbeam.json")
  customTypes = config.CUSTOM_TYPES || {}
  exec = config.NODE_EXEC || require("moonbeam-binary")
} else {
  customTypes = {}
  exec = require("moonbeam-binary")
}

var _createStream = Result.prototype.createStream

Result.prototype.createStream = function (...args) {
  var s = duplexify()

  var opts = { exec, customTypes }

  moonbeam(async web3 => {
    tape.Test.prototype.web3 = web3

    var ts = _createStream.call(this, ...args)
    s.setReadable(ts)

    await Promise.race([
      EventEmitter.once(this, "done"),
      EventEmitter.once(this, "fail")
    ])
  }, opts).catch(e => s.destroy(e))

  return s
}

module.exports = tape

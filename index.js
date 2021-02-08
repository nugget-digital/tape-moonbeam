var tape = require("tape")
var zeppelin = require("@openzeppelin/test-environment")
// https://docs.openzeppelin.com/test-environment/0.1/api

// pollute by design

// Returns an OpenZeppellin test environment contract
tape.Test.prototype.contract = async function (file, props) {
  var ctor = zeppelin.contract.fromArtifact(file)
  // if props given initialize a contract - beware the promise
  return props ? ctor.new(props) : ctor
}

tape.Test.prototype.__defineGetter__("accounts", function () {
  return Array.from(zeppelin.accounts)
})

tape.Test.prototype.__defineGetter__("defaultSender", function () {
  return zeppelin.defaultSender
})

tape.Test.prototype.__defineGetter__("web3", function () {
  return zeppelin.web3
})

tape.Test.prototype.__defineGetter__("provider", function () {
  return zeppelin.provider
})

tape.Test.prototype.__defineGetter__("isHelpersConfigured", function () {
  return zeppelin.isHelpersConfigured
})

module.exports = tape

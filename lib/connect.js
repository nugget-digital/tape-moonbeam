// var Web3 = require("web3")
var ethers = require("ethers").ethers

module.exports = function connect(opts = {}) {
  // TODO handle possible custom types flyin in at opts.customTypes
  // return new Web3(opts.nodeUrl || "http://localhost:9933")
  var provider = new ethers.providers.JsonRpcProvider(opts.nodeUrl || "http://localhost:8545")
  return {
    ethers,
    provider
  }
}

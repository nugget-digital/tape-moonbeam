var Web3 = require("web3")

module.exports = function connect(opts = {}) {
  // TODO handle possible custom types flyin in at opts.customTypes
  return new Web3(opts.nodeUrl || "http://localhost:9933")
}

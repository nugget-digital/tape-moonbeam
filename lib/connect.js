var Web3 = require("web3")

module.exports = function connect(nodeUrl = "http://localhost:9933") {
  // TODO handle possible custom types flyin in at opts.customTypes
  return new Web3(nodeUrl)
}

var Web3 = require("web3")
var { ApiPromise, WsProvider } = require("@polkadot/api")
var typesBundle = require("./types")

module.exports = async function connect({
  wsPort,
  _url = `ws://localhost:${wsPort}`
}) {
  var papi = await ApiPromise.create({
    provider: new WsProvider(_url),
    typesBundle
  })
  return { web3: new Web3(_url), papi }
}

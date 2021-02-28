var Web3 = require("web3")
var { ApiPromise, WsProvider } = require("@polkadot/api")
var typesBundle = require("./types")

module.exports = async function connect({
  wsPort,
  _url = `ws://localhost:${wsPort}`
}) {
  var provider = new WsProvider(_url)
  provider.on(
    "connected",
    provider.on.bind(provider, "error", async function (err) {
      await provider.disconnect()
    })
  )
  var papi = await ApiPromise.create({
    provider,
    ...typesBundle.spec["moonbeam-standalone"]
  })
  return { web3: new Web3(_url), papi }
}

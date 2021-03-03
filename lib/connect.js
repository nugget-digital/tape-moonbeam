var Web3 = require("web3")
var { ApiPromise, WsProvider } = require("@polkadot/api")
var typesBundle = require("./types")

module.exports = async function connect({
  wsPort,
  _url = `ws://localhost:${wsPort}`
}) {
  var web3 = new Web3(_url)

  var provider = new WsProvider(_url)

  provider.on("connected", () =>
    provider.on("error", async _ => await provider.disconnect())
  )

  var polkadotApi = await ApiPromise.create({
    provider,
    ...typesBundle.spec["moonbeam-standalone"]
  })

  return { web3, polkadotApi }
}

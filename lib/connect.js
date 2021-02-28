var Web3 = require("web3")
var { ApiPromise, WsProvider } = require("@polkadot/api")

module.exports = async function connect({
  wsPort,
  _url = `ws://localhost:${wsPort}`,
  customTypes
}) {
  const polkadotApi = await ApiPromise.create({
    provider: new WsProvider(_url),
    types: { Address: "AccountId", LookupSource: "AccountId", ...customTypes }
  })

  return { web3: new Web3(_url), polkadotApi }
}

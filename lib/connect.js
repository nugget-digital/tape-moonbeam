// const jsonrpc = require('@polkadot/types/interfaces/jsonrpc')
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')
const wasmCrypto = require('@polkadot/wasm-crypto')

let keyring
let alice
let bob

module.exports = function connect (opts = {}) {
  return new Promise(async resolve => {
    if (!keyring) {
      await wasmCrypto.waitReady()
      keyring = new Keyring({ type: 'sr25519' })
      alice = keyring.addFromUri('//Alice')
      bob = keyring.addFromUri('//Bob')
    }

    const api = new ApiPromise({
      types: { Address: 'AccountId', LookupSource: 'AccountId', ...opts.customTypes },
      provider: new WsProvider(opts.socket || 'ws://127.0.0.1:9944'),
      // rpc: { ...jsonrpc, ...opts.rpc }
    })

    await api.isReady

    resolve({ api, alice, bob })
  })
}

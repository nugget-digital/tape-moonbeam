var fs = require("fs")
var EventEmitter = require("events")
var assert = require("nanoassert")
var duplexify = require("duplexify")
var tape = require("tape")
var Result = require("tape/lib/results")
var moonbeam = require("./lib/moonbeam")
var compile = require("./lib/compile")()

var pkg = process.cwd() + "/package.json"
var config = fs.existsSync(pkg) ? require(pkg)["tape-moonbeam"] || {} : {}
var opts = {
  execPath: config.execPath || require("moonbeam-binary"),
  port: config.port || 19419,
  rpcPort: config.rpcPort || 19420,
  wsPort: config.wsPort || 19421,
  maxStartMs: config.maxStartMs || 2000
}
opts.argv = config.argv || [
  `--execution=Native`, // faster
  `--no-telemetry`,
  `--no-prometheus`,
  `--dev`,
  `--sealing=manual`,
  `--port=${opts.port}`,
  `--rpc-port=${opts.rpcPort}`,
  `--ws-port=${opts.wsPort}`,
  `--tmp`
]

var _createStream = Result.prototype.createStream

Result.prototype.createStream = function (...args) {
  var duplex = duplexify()

  moonbeam(
    async function ({ web3, papi }) {
      tape.Test.prototype.web3 = web3
      tape.Test.prototype.papi = papi

      duplex.setReadable(_createStream.call(this, ...args))

      await Promise.race([
        EventEmitter.once(this, "done"),
        EventEmitter.once(this, "fail")
      ])
    }.bind(this),
    opts
  ).catch(duplex.destroy.bind(duplex))

  return duplex
}

// make compile available for require so that it can be used in global scope
tape.compile = compile

// pollute some more - put everything else on t...
tape.Test.prototype.falsy = tape.Test.prototype.false
tape.Test.prototype.truthy = tape.Test.prototype.true
tape.Test.prototype.compile = compile

tape.Test.prototype.genesis = Object.freeze({
  address: "0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b",
  privateKey: "99b3c12287537e38c90a9219d4cb074a89a16e9cdb20bf85728ebd97c343e342"
})

tape.Test.prototype.mined = async function mined(tx) {
  var promises = [this.papi.rpc.engine.createBlock(true, true)]
  if (tx) promises.push(this.web3.eth.sendSignedTransaction(tx.rawTransaction))
  var [_, receipt] = await Promise.all(promises)
  if (tx) return receipt
}

tape.Test.prototype.deploy = function deploy(
  artifact,
  from = this.genesis.address,
  privateKey = this.genesis.privateKey
) {
  return this.web3.eth.accounts
    .signTransaction(
      {
        from,
        data: artifact.bytecode,
        value: "0x00",
        gasPrice: "0x01",
        gas: "0x100000"
      },
      privateKey
    )
    .then(
      tx =>
        new Promise((resolve, reject) =>
          this.web3.currentProvider.send(
            {
              jsonrpc: "2.0",
              id: 1,
              method: "eth_sendRawTransaction",
              params: [tx.rawTransaction]
            },
            (err, _response) =>
              err
                ? reject(err)
                : resolve(
                    this.papi.rpc.engine
                      .createBlock(true, true)
                      .then(() =>
                        this.web3.eth
                          .getTransactionReceipt(tx.transactionHash)
                          .then(
                            receipt =>
                              new this.web3.eth.Contract(
                                artifact.abi,
                                receipt.contractAddress
                              )
                          )
                      )
                  )
          )
        )
    )
}

// tape.Test.prototype.fund = async function fund(to, value, data) {
//   assert(to != null, "to must be given")
//   assert(value != null, "value must be given")

//   var txHash = await this.send(
//     {
//       from: address,
//       to,
//       value: value,
//       gasPrice: 1,
//       gas: 8000000n,
//       data
//     },
//     privateKey
//   )

//   return await this.mined(txHash)
// }

// tape.Test.prototype.mined = async function mined(tx) {
//   assert(tx != null, "tx must be given")

//   // eslint-disable-next-line
//   return new Promise(async (resolve, reject) => {
//     const unlisten = await this.eth.subscribe(
//       this.eth.getTransactionReceipt(tx),
//       function (err, res) {
//         if (err) return

//         unlisten()
//         if (helpers.utils.parse.boolean(res.status) === true)
//           return resolve(res)
//         return reject(new Error(res))
//       }
//     )
//   })
// }

// tape.Test.prototype.keygen = async function keygen(privateKey) {
//   return ethKeygen(
//     privateKey,
//     helpers.utils.parse.number(await this.eth.chainId())
//   )
// }

// tape.Test.prototype.keygenSeed = async function keygenSeed(seed) {
//   assert(seed != null, "seed must be given")

//   const privateKey = Buffer.alloc(32)
//   sodium.crypto_generichash(privateKey, Buffer.from(seed))

//   return ethKeygen(
//     privateKey,
//     helpers.utils.parse.number(await this.eth.chainId())
//   )
// }

// tape.Test.prototype.sign = async function sign(
//   { from, to, value = 0, data, gas = 8e6, gasPrice = 1, nonce },
//   privateKey
// ) {
//   assert(privateKey != null, "privateKey must be given")

//   return signer.sign(
//     {
//       from: from == null ? undefined : helpers.utils.format(from),
//       to: to == null ? undefined : helpers.utils.format(to),
//       value: value == null ? undefined : helpers.utils.format(value),
//       data: data == null ? undefined : helpers.utils.format(data),
//       gas: helpers.utils.format(gas),
//       gasPrice: helpers.utils.format(gasPrice),
//       nonce:
//         nonce != null
//           ? helpers.utils.format(nonce)
//           : await this.eth.getTransactionCount(
//               helpers.utils.format(from),
//               "pending"
//             )
//     },
//     privateKey /*, helpers.utils.parse.number(await this.eth.chainId())*/
//   )
// }

// tape.Test.prototype.send = async function send(txObj, privateKey) {
//   const tx = await this.sign(txObj, privateKey)

//   return this.eth.sendRawTransaction(helpers.utils.format(tx.raw))
// }

module.exports = tape

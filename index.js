var fs = require("fs")
var EventEmitter = require("events")
var duplexify = require("duplexify")
var tape = require("tape")
var Result = require("tape/lib/results")
var moonbeam = require("./lib/moonbeam")

let customTypes
let exec

if (fs.existsSync("./.tape-moonbeam.json")) {
  var config = require("./.tape-moonbeam.json")
  customTypes = config.CUSTOM_TYPES || {}
  exec = config.NODE_EXEC || require("moonbeam-binary")
} else {
  customTypes = {}
  exec = require("moonbeam-binary")
}

var _createStream = Result.prototype.createStream

Result.prototype.createStream = function (...args) {
  var duplex = duplexify()

  moonbeam(
    async web3 => {
      tape.Test.prototype.web3 = web3

      duplex.setReadable(_createStream.call(this, ...args))

      await Promise.race([
        EventEmitter.once(this, "done"),
        EventEmitter.once(this, "fail")
      ])
    },
    { exec, customTypes }
  ).catch(err => duplex.destroy(err))

  return duplex
}

// pollute

tape.Test.prototype.fraud = null

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

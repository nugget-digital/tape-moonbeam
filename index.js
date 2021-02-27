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
  customTypes: config.customTypes || {},
  execPath: config.execPath || require("moonbeam-binary")
}

var _createStream = Result.prototype.createStream

Result.prototype.createStream = function (...args) {
  var duplex = duplexify()

  moonbeam(async function (web3) {
    tape.Test.prototype.web3 = web3

    duplex.setReadable(_createStream.call(this, ...args))

    await Promise.race([
      EventEmitter.once(this, "done"),
      EventEmitter.once(this, "fail")
    ])
  }, opts).catch(duplex.destroy.bind(duplex))

  return duplex
}

// make compile available for require so that it can be used in global scope
tape.compile = compile

// pollute some more - put everything else on t...
tape.Test.prototype.compile = compile

tape.Test.prototype.genesis = Object.freeze({
  address: "0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b",
  privateKey: "99b3c12287537e38c90a9219d4cb074a89a16e9cdb20bf85728ebd97c343e342"
})

// tape.Test.prototype.contract = function contract(contractPath) {
//   var artifact = await compile(contractPath)
//   return  new web3.eth.Contract(artifact.abi)
// }

// tape.Test.prototype.deploy = async function deploy({from, data, args = []}) {
//   assert(from, "from address must be given")
//   assert(data, "data must be given")
//   // if not bytecode but a contract path
//   if (typeof data === "string" && !/[0-9a-f]+/.test(data)) data= await compile(data)
//   // if (typeof artifact === "string") artifact = await compile(artifact)

// var tx = data instanceof web3.eth.Contract ?  data .deploy({ arguments: args }) :  new web3.eth.Contract(data.abi) .deploy({ data: data.bytecode, arguments: args })
// }) :  new web3.eth.Contract(data.abi)
//  .deploy({ data: data.bytecode, arguments: args })  .send({ from })
//   return tx    .send({ from })
//   .then(instance => instance.options.address)
// }

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

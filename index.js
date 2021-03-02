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
  maxStartMs: config.maxStartMs || 3000
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

  moonbeam(async ({ web3, papi }) => {
    tape.Test.prototype.web3 = web3
    tape.Test.prototype.papi = papi

    duplex.setReadable(_createStream.call(this, ...args))

    await Promise.race([
      EventEmitter.once(this, "done"),
      EventEmitter.once(this, "fail")
    ])
  }, opts).catch(err => duplex.destroy(err))

  return duplex
}

// make compile available for require so that it can be used in global scope
tape.compile = compile

// pollute tape
tape.GENESIS = Object.freeze({
  address: "0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b",
  privateKey: "99b3c12287537e38c90a9219d4cb074a89a16e9cdb20bf85728ebd97c343e342"
})

// now pollute t...
tape.Test.prototype.compile = compile

tape.Test.prototype.toWei = function toWei(...args) {
  return BigInt(this.web3.utils.toWei(...args))
}

tape.Test.prototype.keygen = function keygen(entropy) {
  return this.web3.eth.accounts.create(entropy)
}

tape.Test.prototype.balance = async function balance(address) {
  assert(address, "address must be given")

  var balance = await this.web3.eth.getBalance(address)

  return BigInt(balance)
}

tape.Test.prototype.send = function send(
  { from, to, data, value = "0x00", gasPrice = "0x01", gas = "0x100000" },
  privateKey
) {
  assert(privateKey, "privateKey must be given")

  if (typeof value === "bigint") value = value.toString()

  return this.web3.eth.accounts
    .signTransaction(
      {
        from,
        to,
        data,
        value,
        gasPrice,
        gas
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
            (err, _response) => (err ? reject(err) : resolve(tx))
          )
        )
    )
}

tape.Test.prototype.mined = async function mined(tx) {
  var promises = [this.papi.rpc.engine.createBlock(true, true)]
  if (tx) promises.push(this.web3.eth.sendSignedTransaction(tx.rawTransaction))
  var [_, receipt] = await Promise.all(promises)
  if (tx) return receipt
}

tape.Test.prototype.fund = async function fund(to, value, data) {
  assert(to, "to must be given")
  assert(value, "value must be given")

  if (typeof value === "bigint") value = value.toString()

  var tx = await this.send(
    {
      from: tape.GENESIS.address,
      to,
      value: value,
      gasPrice: 1,
      gas: 8000000,
      data
    },
    tape.GENESIS.privateKey
  )

  return await this.mined(tx)
}

tape.Test.prototype.transfer = async function transfer(
  { value, to, ...opts },
  privateKey
) {
  assert(value, "params.value must be given")
  assert(to, "params.to must be given")
  assert(privateKey, "privateKey must be given")

  if (typeof value === "bigint") value = value.toString()

  var tx = await this.send({ value, to, ...opts }, privateKey)

  return this.mined(tx)
}

tape.Test.prototype.deploy = function deploy(
  artifacts,
  { from = tape.GENESIS.address, ...opts } = {},
  privateKey = tape.GENESIS.privateKey
) {
  assert(artifacts, "artifacts must be given")
  assert(artifacts.abi, "artifacts.abi must be given")
  assert(artifacts.bytecode, "artifacts.bytecode must be given")
  assert(from, "from must be given")
  assert(privateKey, "privateKey must be given")

  return this.web3.eth.accounts
    .signTransaction(
      {
        value: "0x00",
        gasPrice: "0x01",
        gas: "0x100000",
        ...opts,
        from,
        data: artifacts.bytecode
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
                                artifacts.abi,
                                receipt.contractAddress
                              )
                          )
                      )
                  )
          )
        )
    )
}

tape.Test.prototype.get = async function get(contract, prop, parse) {
  assert(contract, "contract must be given")
  assert(prop, "prop must be given")

  var value = await contract.methods[prop]().call()

  return typeof parse === "function" ? parse(value) : value
}

tape.Test.prototype.invoke = async function invoke(
  contract,
  method,
  args,
  opts,
  privateKey = tape.GENESIS.privateKey
) {
  assert(contract, "contract must be given")
  assert(method, "method must be given")

  var args = Array.isArray(args) ? args : args === undefined ? [] : [args]
  var data = contract.methods[method](...args).encodeABI()

  var tx = await this.send(
    { ...opts, to: contract.options.address, data },
    privateKey
  )

  return this.mined(tx)
}

module.exports = tape

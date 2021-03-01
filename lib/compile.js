var fs = require("fs").promises
var path = require("path")
var solc = require("solc")

module.exports = function init(_cache = new Map()) {
  return async function compile(contractPath, opts = {}) {
    if (!opts.noCache && _cache.has(contractPath))
      return _cache.get(contractPath)

    var contractName =
      opts.contractName || path.basename(contractPath).replace(".sol", "")

    var content = await fs.readFile(contractPath, "utf8")

    var input = {
      language: "Solidity",
      sources: { [contractPath]: { content } },
      settings: { outputSelection: { "*": { "*": ["*"] } } }
    }

    var output = JSON.parse(solc.compile(JSON.stringify(input)))

    if (output?.errors?.length) {
      for (var err of output.errors) console.error(err.formattedMessage)
      throw Error("compiling with solc resulted in errors")
    }

    var artifacts = output.contracts[contractPath][contractName]

    artifacts.bytecode = artifacts.evm.bytecode.object

    if (opts.initParams && this.web3) {
      var encodedParams = this.web3.eth.abi
        .encodeParameters(opts.initParams.types, opts.initParams.values)
        .slice(2)

      artifacts.bytecode += encodedParams
    }

    _cache.set(contractPath, artifacts)

    return artifacts
  }
}

var fs = require("fs").promises
var path = require("path")
var solc = require("solc")

module.exports = function init(_cache = new Map()) {
  return async function compile(
    contractPath,
    contractName = path.basename(contractPath).replace(".sol", "")
  ) {
    if (_cache.has(contractPath)) return _cache.get(contractPath)

    var input = {
      language: "Solidity",
      sources: {
        [contractPath]: {
          content: await fs.readFile(contractPath, "utf8")
        }
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"]
          }
        }
      }
    }

    var output = JSON.parse(solc.compile(JSON.stringify(input)))

    var contract = output.contracts[contractPath][contractName]

    contract.bytecode = contract.evm.bytecode.object

    _cache.set(contractPath, contract)

    return contract
  }
}

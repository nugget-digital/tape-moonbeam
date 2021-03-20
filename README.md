# tape-moonbeam

[![ci](https://github.com/nuggetdigital/tape-moonbeam/workflows/ci/badge.svg)](https://github.com/nuggetdigital/tape-moonbeam/actions/workflows/ci.yml)

Run `tape` tests backed by a `moonbeam` dev chain

### Usage 

```js
tape("transferin", async t => {
  const bezos = t.keygen()
  const biiko = t.keygen()
  const share = t.toWei("100000", "ether")

  const receipt = await t.transfer(
    { to: biiko.address, value: share },
    bezos.privateKey
  )

  balance = await t.balance(biiko.address)

  t.equal(balance, share, "thanks 4 sharin")
})
```

## API

A fresh Moonbeam dev chain will be created for each test case

### `test([description], async t => {})`

Create a new `test` just like in tape. `t` is extended with extra methods
specified below:

### `t.web3`

Standard `Web3` instance

### `t.polkadotApi`

Standard `@polkadot/api` `ApiPromise` instance

### `const wei = t.toWei("100", "ether")`

Helper from `t.web3.utils` exposed on top level 4 convenience. Returns a `bigint`.

### `await t.fund(address, value, [data])`

Fund `address` with `value` wei and optional `data`. `value` can be `Number`, `BigInt` or hex encoded string. Await the transaction to be mined. Resolves to a transaction receipt.

### `const receipt = await t.mined(tx)`

Await `tx` to be mined and return the transaction receipt. `tx` is returned by `t.send(...)`.

### `const account = await t.keygen([mnemonic])`

Generate a new account. Just a proxy to `t.web3.eth.accounts.create([mnemonic])`.

### `const balance = await t.balance(address)`

Retrieve the balance of given address. Resolves to a `bigint`.

### `t.transfer(address, value, [opts], [privateKey])`

Transfer `value` to `address`. `opts` will be passed through to `t.send`. Defaults to the genesis `privateKey`. For convenience you can pass the private key as third argument while omitting options entirely. Resolves to a transaction receipt.

### `t.compile(contractPath, [opts])`

Compiles a `Solidity` contract @ `contractPath` with `solc` resolving to an `àrtifacts` object that looks like `{ abi, bytecode }`. Setting `opts.noCache` to `true` bypasses the compile cache. `opts.initParams` can be used to pass parameters to contract `constructor`s at instantiation. Example `opts`: 

```js
{ noCache: false, initParams: { types: ["uint256"], values: [419n] } }
```

### `t.deploy(artifacts, [opts], [privateKey])`

Deploys a contract given its compilation `artifacts`. `opts` are merged with `t.web3.eth.accounts.signTransaction`'s options. Use `privateKey` to override the contract creator. Resolves to a `t.web3.eth.Contract` instance.

### `t.get(contract, prop, [parse])`

Reads `prop` from a `contract`, probably created with `t.deploy`. `parse` can be a function to transform the raw property upon `resolve`, fx `BigInt`.  

### `t.invoke(contract, method, [arg])`

Invoke a `contract`s `method` with optional arguments you may want to send along with your invocation. `arg` can be a single value or an array of arguments. Resolves to a transaction receipt.

### `const tx = await t.send({ from, to, data, nonce, value = 0, gasPrice = 1, gas = 8e6 }, privateKey)`

Sign and send a new transaction with the above parameters. Note the `privateKey`
at the end required for signing. Resolves to a transaction.

## Config

You can configure the moonbeam node a little using a `tape-moonbeam` prop at the top-level of your `package.json`. An example, showcasing the defaults:

```json
{
  "dependencies": {
    "tape-moonbeam": "nuggetdigital/tape-moonbeam#v0.6.1",
  },
  "scripts":{
    "test": "node ./test.js"
  },
  "tape-moonbeam": {
    "execPath": null,
    "port": 19419,
    "rpcPort": 19420,
    "wsPort": 19421,
    "maxStartMs": 3000,
    "argv": [
      "--execution=Native",
      "--no-telemetry",
      "--no-prometheus",
      "--dev",
      "--sealing=manual",
      "--port=19419",
      "--rpc-port=19420",
      "--ws-port=19421",
      "--tmp"
    ]
  }
}
```

## Prior art

This is just a derivative of `@emilbayes` [`tape-parity`](https://github.com/hyperdivision/tape-parity)

## License

[MIT](./LICENSE)
# tape-moonbeam

run `tape` tests backed by a `moonbeam` dev chain

absolutely copied from [`tape-parity`](https://github.com/hyperdivision/tape-parity)

### usage 

```js
tape("transferin", async t => {
  const bezos = t.keygen()
  const biiko = t.keygen()
  const share = t.toWei("1000", "ether")

  const receipt = await t.transfer(
    { to: biiko.address, value: share },
    bezos.privateKey
  )

  balance = await t.balance(biiko.address)

  t.equal(balance, share, "thanks 4 sharin")
})
```

## api

a fresh Moonbeam dev chain will be created for each test case.

### `test([description], async t => {})`

Create a new `test` just like in tape. `t` is extended with extra methods
specified below:

### `t.web3`

standard `Web3` instance.

### `t.polkadotApi`

standard `@polkadot/api` `ApiPromise` instance.

### `const wei = t.toWei("100", "ether")`

Helper from `t.web3.utils` exposed on top level 4 convenience. Returns a `bigint`.

### `await t.fund(address, value, [data])`

Fund `address` with `value` wei and optional `data`. Await the transaction to be
mined. `value` can be `Number`, `BigInt` or hex encoded string.

### `const receipt = await t.mined(tx)`

Await `tx` to be mined and return the transaction receipt. `tx` is returned by `t.send(...)`.

### `const account = await t.keygen([mnemonic])`

Generate a new account. Just a proxy to `t.web3.eth.accounts.create([mnemonic])`.

### `const balance = await t.balance(address)`

Retrieve the balance of given address.Resolves with a `bigint`.

### `t.transfer(address, value, [opts], [privateKey])`

Defaults to the genesis private key.

### `t.compile(contractPath, [opts])`

### `t.deploy(artifacts, [opts], [privateKey])`

### `t.get(contract, prop, [parse])`

### `const tx = await t.send({ from, to, data, nonce, value = 0, gasPrice = 1, gas = 8e6 }, privateKey)`

Sign and send a new transaction with the above parameters. Note the `privateKey`
at the end required for signing.

Examples:

* To deploy a contract, send with `{ from, data }`.
* To transfer funds, send with `{ to, value }`.
* To call a smart contract, send with `{ to, data }`.

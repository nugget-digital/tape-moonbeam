var tape = require("..")

tape.skip("alice transfers to bob", async t => {
  var tx = await t.web3.eth.accounts.signTransaction(
    {
      from: t.genesis.address,
      to: "0x44236223aB4291b93EEd10E4B511B37a398DEE55",
      value: t.web3.utils.toWei("100", "ether"),
      gas: 21000
    },
    t.genesis.privateKey
  )

  var receipt = await t.web3.eth.sendSignedTransaction(tx.rawTransaction)

  t.ok(receipt.transactionHash)

  t.end()
})

tape("web3 listin accounts", async t => {
  var accounts = await t.web3.eth.getAccounts()
  console.log(accounts)
})

tape("deployin & interactin with the incrementer contract", async t => {
  var initValue = 0x1a3

  var artifact = await t.compile(require.resolve("./Incrementer.sol"), {
    initParams: { types: ["uint256"], values: [initValue] }
  })

  var contract = await t.deploy(artifact)

  t.comment(contract.options.address)

  var num = await contract.methods.number().call()

  t.equal(num, initValue)

  /*
  const { abi } = require('./compile');

// Initialization
const privKey =
   '99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342'; // Genesis private key
const address = '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b';
const web3 = new Web3('http://localhost:9933');
const contractAddress = '0xC2Bf5F29a4384b1aB0C063e1c666f02121B6084a';
const _value = 3;

// Contract Tx
const incrementer = new web3.eth.Contract(abi, contractAddress);
const incrementTx = incrementer.methods.increment(_value);

const increment = async () => {
   console.log(
      `Calling the increment by ${_value} function in contract at address ${contractAddress}`
   );
   const createTransaction = await web3.eth.accounts.signTransaction(
      {
         from: address,
         to: contractAddress,
         data: incrementTx.encodeABI(),
         gas: await incrementTx.estimateGas(),
      },
      privKey
   );

   const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
   );
   console.log(`Tx successfull with hash: ${createReceipt.transactionHash}`);
};

increment(); 
  */

  // t.end()
})

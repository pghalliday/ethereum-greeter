const fs = require('fs');
const path = require('path');
const promisify = require('es6-promisify');
const constants = require('./lib/constants');
const web3 = require('./lib/web3');
const getFirstLine = require('./lib/get-first-line');

const preadFile = promisify(fs.readFile);
const pgetCoinbase = promisify(web3.eth.getCoinbase, web3.eth);
const punlockAccount = promisify(web3.personal.unlockAccount, web3.personal);
const pgetCode = promisify(web3.eth.getCode, web3.eth);

async function killContract({
  passPhraseFile,
  addressFile,
  abiFile,
}) {
  console.log('read abi');
  const abiJson = await preadFile(abiFile, 'utf8');
  const abi = JSON.parse(abiJson);
  console.log('create contract factory');
  const contractFactory = web3.eth.contract(abi);
  console.log('get coinbase account');
  const coinbase = await pgetCoinbase();
  console.log('read pass phrase');
  const coinbasePassPhrase = await preadFile(passPhraseFile, 'utf8');
  console.log('unlock account');
  await punlockAccount(coinbase, getFirstLine(coinbasePassPhrase));
  console.log('read address');
  const address = await preadFile(addressFile, 'utf8');
  console.log('get contract');
  const contract = contractFactory.at(address);
  console.log('kill contract');
  const psendTransaction = promisify(contract.kill.sendTransaction, contract.kill);
  await psendTransaction({
    from: coinbase,
  });
  // contract is not killed immediately so the first time
  // this is called, it will likely return the contract
  // code - if you wait a bit though it will return `0x`
  const code = await pgetCode(address);
  console.log(`done: ${code}`);
}

killContract({
  passPhraseFile: constants.passPhraseFile,
  addressFile: constants.addressFile,
  abiFile: constants.abiFile,
}).catch((error) => console.error(error.stack));

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const net = require('net');
const promisify = require('es6-promisify');

const provider = `${__dirname}/data/geth.ipc`;
const addressFile = `${__dirname}/data/greeter.address`;
const abiFile = `${__dirname}/data/greeter.abi`;
const passPhraseFile = path.join(__dirname, '.pass-phrase');

console.log(`Create web3 provider: ${provider}`);
const web3 = new Web3(new Web3.providers.IpcProvider(provider, net));

const preadFile = promisify(fs.readFile);
const pgetCoinbase = promisify(web3.eth.getCoinbase, web3.eth);
const punlockAccount = promisify(web3.personal.unlockAccount, web3.personal);
const pgetCode = promisify(web3.eth.getCode, web3.eth);

function getFirstLine(text) {
  return text.slice(0, text.indexOf('\n'));
}

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
  passPhraseFile,
  addressFile,
  abiFile,
}).catch((error) => console.error(error.stack));

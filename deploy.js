const fs = require('fs');
const path = require('path');
const promisify = require('es6-promisify');
const constants = require('./lib/constants');
const web3 = require('./lib/web3');
const getFirstLine = require('./lib/get-first-line');

const preadFile = promisify(fs.readFile);
const pwriteFile = promisify(fs.writeFile);
const pgetCoinbase = promisify(web3.eth.getCoinbase, web3.eth);
const punlockAccount = promisify(web3.personal.unlockAccount, web3.personal);
const pgetCode = promisify(web3.eth.getCode, web3.eth);

async function deployContract({
  contractArgs,
  passPhraseFile,
  gas,
  addressFile,
  abiFile,
  codeFile,
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
  console.log('read code');
  const code = await preadFile(codeFile, 'utf8');
  console.log('deploy contract');
  contractFactory.new(...contractArgs, {
    from: coinbase,
    data: '0x' + code,
    gas,
  }, async (error, contract) => {
    if (error) {
      console.error(error.stack);
    } else {
      if (!contract.address) {
        console.log(`Contract transaction send: transactionHash: ${contract.transactionHash} waiting to be mined...`);
      } else {
        console.log(`Contract mined! Address: ${contract.address}`);
        console.log('write address');
        await pwriteFile(addressFile, contract.address);
        const code = await pgetCode(contract.address);
        console.log(`done: ${code}`);
      }
    }
  });
}

deployContract({
  contractArgs: constants.contractArgs,
  passPhraseFile: constants.passPhraseFile,
  gas: constants.gas,
  addressFile: constants.addressFile,
  abiFile: constants.abiFile,
  codeFile: constants.codeFile,
}).catch((error) => console.error(error.stack));

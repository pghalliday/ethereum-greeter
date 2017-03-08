const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const net = require('net');
const promisify = require('es6-promisify');

const provider = `${__dirname}/data/geth.ipc`;
const addressFile = `${__dirname}/data/greeter.address`;
const abiFile = `${__dirname}/data/greeter.abi`;
const contractFile = path.join(__dirname, 'greeter.sol');
const passPhraseFile = path.join(__dirname, '.pass-phrase');
const contractName = 'greeter';
const contractArgs = ['Hello World!'];
const gas = 300000;

console.log(`Create web3 provider: ${provider}`);
const web3 = new Web3(new Web3.providers.IpcProvider(provider, net));

const preadFile = promisify(fs.readFile);
const pwriteFile = promisify(fs.writeFile);
const pcompile = promisify(web3.eth.compile.solidity, web3.eth.compile);
const pgetCoinbase = promisify(web3.eth.getCoinbase, web3.eth);
const punlockAccount = promisify(web3.personal.unlockAccount, web3.personal);
const pgetCode = promisify(web3.eth.getCode, web3.eth);

function getFirstLine(text) {
  return text.slice(0, text.indexOf('\n'));
}

async function deployContract({
  contractFile,
  contractName,
  contractArgs,
  passPhraseFile,
  gas,
  addressFile,
  abiFile,
}) {
  console.log('read contract source');
  const contractSource = await preadFile(contractFile, 'utf8');
  console.log(`compiling: ${contractFile}`);
  const compiled = await pcompile(contractSource);
  const contractCompiled = compiled[`<stdin>:${contractName}`];
  console.log('write abi');
  await pwriteFile(abiFile, JSON.stringify(contractCompiled.info.abiDefinition));
  console.log('create contract factory');
  const contractFactory = web3.eth.contract(contractCompiled.info.abiDefinition);
  console.log('get coinbase account');
  const coinbase = await pgetCoinbase();
  console.log('read pass phrase');
  const coinbasePassPhrase = await preadFile(passPhraseFile, 'utf8');
  console.log('unlock account');
  await punlockAccount(coinbase, getFirstLine(coinbasePassPhrase));
  console.log('deploy contract');
  contractFactory.new(...contractArgs, {
    from: coinbase,
    data: contractCompiled.code,
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
  contractFile,
  contractName,
  contractArgs,
  passPhraseFile,
  gas,
  addressFile,
  abiFile,
}).catch((error) => console.error(error.stack));

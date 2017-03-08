const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const net = require('net');
const promisify = require('es6-promisify');

const provider = `${__dirname}/data/geth.ipc`;
const addressFile = `${__dirname}/data/greeter.address`;
const abiFile = `${__dirname}/data/greeter.abi`;
const method = 'greet';
const args = [];


console.log(`Create web3 provider: ${provider}`);
const web3 = new Web3(new Web3.providers.IpcProvider(provider, net));

const preadFile = promisify(fs.readFile);

async function callContract({
  addressFile,
  abiFile,
  method,
  args,
}) {
  console.log('read abi');
  const abiJson = await preadFile(abiFile, 'utf8');
  const abi = JSON.parse(abiJson);
  console.log('create contract factory');
  const contractFactory = web3.eth.contract(abi);
  console.log('read contract address');
  const address = await preadFile(addressFile, 'utf8');
  console.log('get contract');
  const contract = contractFactory.at(address);
  console.log('call contract');
  const pmethod = promisify(contract[method], contract);
  return await pmethod(...args);
}

callContract({
  addressFile,
  abiFile,
  method,
  args,
}).then((result) => {
  console.log(`result: ${result}`);
}).catch((error) => console.error(error.stack));

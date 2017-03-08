const fs = require('fs');
const path = require('path');
const promisify = require('es6-promisify');
const constants = require('./lib/constants');
const web3 = require('./lib/web3');

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
  addressFile: constants.addressFile,
  abiFile: constants.abiFile,
  method: constants.method,
  args: constants.args,
}).then((result) => {
  console.log(`result: ${result}`);
}).catch((error) => console.error(error.stack));

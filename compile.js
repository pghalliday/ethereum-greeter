const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const promisify = require('es6-promisify');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const constants = require('./lib/constants');
const web3 = require('./lib/web3');

const primraf = promisify(rimraf);
const pmkdirp = promisify(mkdirp);
const preadFile = promisify(fs.readFile);
const pwriteFile = promisify(fs.writeFile);
const pcompile = promisify(web3.eth.compile.solidity, web3.eth.compile);

async function compileContract({
  buildDir,
  contractFile,
  contractName,
  abiFile,
  codeFile,
}) {
  console.log('clean');
  await primraf(buildDir);
  await pmkdirp(buildDir);
  console.log('read contract source');
  const contractSource = await preadFile(contractFile, 'utf8');
  console.log(`compiling: ${contractFile}`);
  const compiled = await pcompile(contractSource);
  const contractCompiled = compiled[`<stdin>:${contractName}`];
  console.log('write abi');
  await pwriteFile(abiFile, JSON.stringify(contractCompiled.info.abiDefinition));
  console.log('write code');
  await pwriteFile(codeFile, contractCompiled.code);
  console.log(`done`);
  web3.reset();
}

compileContract({
  buildDir: constants.buildDir,
  contractFile: constants.contractFile,
  contractName: constants.contractName,
  abiFile: constants.abiFile,
  codeFile: constants.codeFile,
}).catch((error) => console.error(error.stack));

const solc = require('solc');
const fs = require('fs');
const path = require('path');
const promisify = require('es6-promisify');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const constants = require('./lib/constants');

const primraf = promisify(rimraf);
const pmkdirp = promisify(mkdirp);
const preadFile = promisify(fs.readFile);
const pwriteFile = promisify(fs.writeFile);

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
  const compiled = solc.compile(contractSource, 1);
  const contractCompiled = compiled.contracts[`:${contractName}`];
  console.log('write abi');
  await pwriteFile(abiFile, contractCompiled.interface);
  console.log('write code');
  await pwriteFile(codeFile, contractCompiled.bytecode);
  console.log(`done`);
}

compileContract({
  buildDir: constants.buildDir,
  contractFile: constants.contractFile,
  contractName: constants.contractName,
  abiFile: constants.abiFile,
  codeFile: constants.codeFile,
}).catch((error) => console.error(error.stack));

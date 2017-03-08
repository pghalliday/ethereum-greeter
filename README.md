# ethereum-greeter

## Prerequistes

- [ethereum](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)
- [solidity](https://solidity.readthedocs.io/en/develop/installing-solidity.html) (the binary, not the NPM package)
- [NodeJS](https://nodejs.org/en/) > 7.6.0

```
npm install
```

- Create a `.pass-phrase` file to contain the pass phrase for the single account.

## Usage

```
// initialise a test net from genesis.json and create a single account with the pass phrase
./init.sh

// start the test network and start mining
./start.sh

// compile the contract (compiles greeter.sol, writing the abi and code to the build directory)
node compile.js

// OR compile the contract with the JS compiler (compiles greeter.sol, writing the abi and code to the build directory)
// NB. This is much slower than using web3 and the binary compiler available in the running node
node compile-js.js

// OR compile the contract directly with the binary compiler (compiles greeter.sol, writing the abi and code to the build directory)
// NB. This is fastest but comparable to using web3 and doing it through the running node
./compile.sh

// deploy the contract (writes address to the data directory)
node deploy.js

// call the contract method
node call.js

// Cleanup by killing the contract
node kill.js
```

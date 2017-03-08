# ethereum-test

First create a `.pass-phrase` file to contain the pass phrase for the single account. Then...

```
// initialise a test net from genesis.json and create a single account with the pass phrase
./init.sh

// start the test network and start mining
./start.sh

// deploy the contract (compiles greeter.sol, writes the abi and address to the data directory)
node deploy.js

// call the contract method (reads the abi and address from the data directory)
node call.js

// Cleanup by killing the contract
node kill.js
```

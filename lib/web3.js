const Web3 = require('web3');
const net = require('net');
constants = require('./constants');

console.log(`Create web3 provider: ${constants.provider}`);
module.exports = new Web3(new Web3.providers.IpcProvider(constants.provider, net));

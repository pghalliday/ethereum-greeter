#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rm -rf $DIR/build
mkdir -p $DIR/build
cd $DIR
solc --gas --bin --abi --optimize -o $DIR/build greeter.sol

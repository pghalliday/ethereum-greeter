#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
geth --datadir $DIR/data init $DIR/genesis.json
geth --password $DIR/.pass-phrase --datadir $DIR/data account new

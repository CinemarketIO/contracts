#!/bin/bash

if [ "${NETWORK}" = "localhost" ]
then
    concurrently 'npm run watch' 'ganache-cli --networkId 15 --gasLimit=50000000 -h=0.0.0.0 -p 8545 -m candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
else
    npm run migrate -- --network=${NETWORK}
fi

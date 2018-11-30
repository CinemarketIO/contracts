# Cinemarket Contracts

## Installation

```
$ npm i
$ npm install -g ganache-cli
$ ganache-cli --networkID 15 --gasLimit=50000000 -h=0.0.0.0 -p 8545 -m candy maple cake sugar pudding cream honey rich smooth crumble sweet treat

# In new tab
$ npm run watch
```

## Run it with Docker

Runs `ganache-cli` automatically and exposes port 8545.

```
docker build -t contracts .
docker run -d -p 8545:8545 contracts
```

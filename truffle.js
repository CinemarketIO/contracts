// @format
require("dotenv").config();
const Web3 = require("web3");
const web3 = new Web3();
const Wallet = require("ethereumjs-wallet");
const HDWalletProvider = require("truffle-hdwallet-provider");

var rinkebyProvider;

if (process.env["RINKEBY_PRIVATE_KEY"]) {
  const privateKey = process.env["RINKEBY_PRIVATE_KEY"];
  rinkebyProvider = new HDWalletProvider(
    privateKey,
    "https://rinkeby.infura.io"
  );
}

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "15"
    },
    rinkeby: {
      provider: rinkebyProvider,
      // You can get the current gasLimit by running
      // truffle deploy --network rinkeby
      // truffle(rinkeby)> web3.eth.getBlock("pending", (error, result) =>
      //   console.log(result.gasLimit))
      gas: 4600000,
      gasPrice: web3.utils.toWei("20", "gwei"),
      network_id: "4"
    }
  }
};

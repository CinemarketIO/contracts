// @format
require("dotenv").config();
const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");

const COALAIPRight = require("../build/contracts/COALAIPRight.json");
const CentralizedArbitrator = require("../build/contracts/CentralizedArbitrator.json");

(async function() {
  const web3 = new Web3(
    new Web3.providers.HttpProvider("http://localhost:8545")
  );
  const accounts = await web3.eth.getAccounts();
  const networkId = 15; // ganache

  const CAAddress = CentralizedArbitrator.networks[networkId].address;
  const rightAddress = COALAIPRight.networks[networkId].address;
  const arbitrator = new web3.eth.Contract(
    CentralizedArbitrator.abi,
    CAAddress
  );
  const extraData = "0x" + Buffer.from("abc", "utf8").toString("hex");

  await arbitrator.methods.createDispute(3, extraData).send({
    from: accounts[1],
    value: 1,
    gas: 1000000
  });
})();

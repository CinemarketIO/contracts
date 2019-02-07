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
  const right = new web3.eth.Contract(COALAIPRight.abi, rightAddress);
  const owner = accounts[0];
  const defendant = accounts[1];
  const prosecutor = accounts[2];

  const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
  const tokenURI = "0x" + Buffer.from(hash, "utf8").toString("hex");
  const addresses = [defendant];

  await right.methods
    .mint(addresses, tokenURI)
    .send({ from: defendant, gas: 1000000 });
  const tokenId =
    parseInt(await right.methods.totalSupply().call({ from: owner }), 10) - 1;
  await right.methods
    .raiseDispute(tokenId)
    .send({ from: prosecutor, value: 1, gas: 1000000 });

  const disputeId =
    (await arbitrator.methods.getDisputesLength().call({ from: owner })) - 1;

  // Rule in favor of the defendant
  await arbitrator.methods
    .giveRuling(disputeId, 1)
    .send({ from: owner, gas: 1000000 });
})();

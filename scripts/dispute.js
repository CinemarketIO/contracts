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
  const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
  const tokenURI = "0x" + Buffer.from(hash, "utf8").toString("hex");
  const addresses = [accounts[0]];

  await right.methods.mint(addresses, tokenURI).send({
    from: accounts[0],
    gas: web3.utils.toHex(1000000)
  });
  const tokenId =
    (await right.methods.totalSupply().call({ from: accounts[0] })) - 1;
  await right.methods.raiseDispute(tokenId).send({
    from: accounts[1],
    value: 1,
    gas: 1000000
  });
  const dispute = await arbitrator.methods
    .disputes(0)
    .call({ from: accounts[0] });
})();

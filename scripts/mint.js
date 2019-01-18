// @format
const Web3 = require("web3");

const COALAIPRight = require("../build/contracts/COALAIPRight.json");

(async function() {
  var publicKey = "0x03e2edce4bb10110c3b75d14737100c0c34f7199";

  const provider = new Web3.providers.HttpProvider("http://localhost:8545");
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const accounts = await web3.eth.getAccounts();

  const address = COALAIPRight.networks[networkId].address;
  const contract = new web3.eth.Contract(COALAIPRight.abi, address);

  const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
  const tokenURI = "0x" + Buffer.from(hash, "utf8").toString("hex");
  const addresses = [accounts[0]];
  await contract.methods
    .mint(addresses, tokenURI)
    .send({ from: publicKey, gas: 300000 });
  console.log(await contract.methods.tokenURI(0).call({ from: publicKey }));

  // Mint multiple tokens
  let tokenURIs = "";
  for (let i = 0; i < 10; i++) {
    tokenURIs += hash;
    if (i !== 9) {
      tokenURIs += ":";
    }
  }
  console.log(tokenURIs);
  tokenURIs = "0x" + Buffer.from(tokenURIs, "utf8").toString("hex");

  await contract.methods
    .mint(accounts, tokenURIs)
    .send({ gas: 300000 * 10, from: publicKey });
  const ipfsProvider = await contract.methods.ipfsProvider().call({
    from: publicKey
  });
  for (let i = 0; i < 10; i++) {
    console.log(
      await contract.methods.balanceOf(accounts[i]).call({ from: publicKey })
    );
    console.log(
      await contract.methods.tokenURI(i).call({ from: publicKey }),
      `${ipfsProvider}${hash}`
    );
  }
})();

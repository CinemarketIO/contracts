// @format
require("dotenv").config();
const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");
const Wallet = require("ethereumjs-wallet");
const Tx = require("ethereumjs-tx");
const IPFS = require("ipfs-http-client");

const COALAIPRight = require("../build/contracts/COALAIPRight.json");
const ipfs = IPFS("ipfs.infura.io", "5001", { protocol: "https" });

async function send(web3, from, to, method, privateKey) {
  const data = method.encodeABI();
  const count = await web3.eth.getTransactionCount(from);
  const rawTx = {
    from,
    to,
    nonce: web3.utils.toHex(count),
    gasPrice: web3.utils.toHex(web3.utils.toWei("21", "gwei")),
    gasLimit: web3.utils.toHex(await method.estimateGas({ from: from })),
    data: data
  };
  let tx = new Tx(rawTx);
  tx.sign(Buffer.from(privateKey, "hex"));
  tx = "0x" + tx.serialize().toString("hex");
  console.log("Sending transaction from", from, "to", to);
  await web3.eth.sendSignedTransaction(tx);
}

async function uploadToIPFS(tokenJSON) {
  return (await ipfs.add(Buffer.from(JSON.stringify(tokenJSON))))[0][
    "hash"
  ];
}

(async function() {
  const privateKey = process.env["RINKEBY_PRIVATE_KEY"];
  const provider = new HDWalletProvider(
    privateKey,
    "https://rinkeby.infura.io"
  );
  const web3 = new Web3(provider);
  const publicKey = web3.utils.toChecksumAddress(provider.getAddress(0));
  const networkId = 4; // rinkeby

  const address = COALAIPRight.networks[networkId].address;
  const contract = new web3.eth.Contract(COALAIPRight.abi, address);

  const tokenJSON = {
    "@context": "http://coalaip.schema/",
    "@type": "Right",
    rightType: "License",
    usages: "all",
    name: "Test",
    image:
      "https://ipfs.infura.io/ipfs/QmX8n3kPkmwC4gNyztG1X7ov5GDdct2Dj4NALXJYtqyMb6",
    territory: "USA",
    context: "Film Festivals",
    validFrom: {
      "@type": "Date",
      "@value": "2018-12-13T14:12:17+01:00"
    },
    validTo: {
      "@type": "Date",
      "@value": "2019-12-13T14:12:17+01:00"
    },
    rightsOf: "QmafKsC2eZ9GBcEx3x8zTq3B3kC1ecjtLVWPhPRkFfF8Zo",
    license: "QmbJUddfKUQHYCWkMZH6N43rpGckZe7nEY48Pvs7RzCXpN"
  };

  const hash = await uploadToIPFS(tokenJSON);
  const tokenURI = "0x" + Buffer.from(hash, "utf8").toString("hex");
  await send(
    web3,
    publicKey,
    address,
    contract.methods.mint([publicKey], tokenURI),
    privateKey
  );
  console.log(await contract.methods.tokenURI(0).call({ from: publicKey }));

  // Mint multiple tokens
  let tokenURIs = "";
  for (let i = 0; i < 5; i++) {
    tokenURIs += hash;
    if (i !== 4) {
      tokenURIs += ":";
    }
  }
  const publicKeys = [];
  for (let i = 0; i < 5; i++) {
    publicKeys.push(publicKey);
  }
  tokenURIs = "0x" + Buffer.from(tokenURIs, "utf8").toString("hex");

  await send(
    web3,
    publicKey,
    address,
    contract.methods.mint(publicKeys, tokenURIs),
    privateKey
  );
  const ipfsProvider = await contract.methods.ipfsProvider().call({
    from: publicKey
  });
  for (let i = 0; i < 5; i++) {
    console.log(
      await contract.methods.balanceOf(publicKeys[i]).call({ from: publicKey })
    );
    console.log(
      await contract.methods.tokenURI(i).call({ from: publicKey }),
      `${ipfsProvider}${hash}`
    );
  }
})();

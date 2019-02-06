// @format
const truffleAssert = require("truffle-assertions");

var CoalaIPRight = artifacts.require("./build/contracts/COALAIPRight");
var CentralizedArbitrator = artifacts.require(
  "./build/contracts/CentralizedArbitrator"
);

const arbitration = {
  price: 1,
  timeout: 1,
  extraData: "0x" + Buffer.from("abc", "utf8").toString("hex")
};

contract("COALA IP Right", function(accounts) {
  it("should create a single token", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
    const tokenURI = "0x" + Buffer.from(hash, "utf8").toString("hex");
    const addresses = [accounts[0]];

    const res = await token.mint(addresses, tokenURI, {
      from: accounts[0]
    });

    const IPFSProvider = await token.IPFSProvider.call();
    assert.equal(await token.balanceOf(addresses[0]), 1);
    assert.equal(await token.tokenURI(0), IPFSProvider + hash);
    assert.equal(await token.ownerOf(0), addresses[0]);
    truffleAssert.eventEmitted(res, "Transfer", ev => {
      return ev._to === addresses[0];
    });
  });
  it("should create 10 new tokens", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
    let tokenURIs = "";
    for (let i = 0; i < 10; i++) {
      tokenURIs += hash;
      if (i !== 9) {
        tokenURIs += ":";
      }
    }
    tokenURIs = "0x" + Buffer.from(tokenURIs, "utf8").toString("hex");

    await token.mint(accounts, tokenURIs, {
      from: accounts[0]
    });
    const IPFSProvider = await token.IPFSProvider.call();
    for (let i = 0; i < 10; i++) {
      assert.equal(await token.balanceOf(accounts[i]), 1);
      assert.equal(await token.tokenURI(i), `${IPFSProvider}${hash}`);
    }
  });
  it("should revert if intruder trys to set IPFSProvider", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const intruder = accounts[1];
    await truffleAssert.fails(
      token.setIPFSProvider("malicious ipfs url", { from: intruder }),
      truffleAssert.ErrorType.REVERT
    );
  });
  it("should allow owner to set the IPFSProvider", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const owner = accounts[0];
    const provider = "new ipfs provider";
    await token.setIPFSProvider(provider, { from: owner });
    assert.equal(await token.IPFSProvider.call(), provider);
  });
  it("should revert if intruder trys to set Arbitrator", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const intruder = accounts[1];
    await truffleAssert.fails(
      token.setArbitrator(0x0, { from: intruder }),
      truffleAssert.ErrorType.REVERT
    );
  });
  it("should allow owner to set the Arbitrator", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const owner = accounts[0];
    await token.setArbitrator(0x0, { from: owner });
    assert.equal(await token.arbitrator.call(), 0x0);
  });
  it("should allow to raise a dispute for an existing token", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
    const tokenURI = "0x" + Buffer.from(hash, "utf8").toString("hex");
    const addresses = [accounts[0]];

    await token.mint(addresses, tokenURI, {
      from: accounts[0]
    });
    const tokenId = parseInt(await token.totalSupply(), 10) - 1;
    const res = await token.raiseDispute(tokenId, {
      from: accounts[1],
      value: 1
    });

    // Token should go to contract address
    assert.equal(await token.ownerOf(tokenId), token.address);
    // Approval for msg.sender should be cleared again
    assert.equal(await token.getApproved(tokenId), 0x0);

    // Confirm that dispute call was successful
    truffleAssert.eventEmitted(res, "Dispute", ev => {
      return (
        ev._arbitrator === arbitrator.address &&
        ev._disputeID.toNumber() === 0 &&
        ev._metaEvidenceID.toNumber() === tokenId
      );
    });
  });
  it("should revert if dispute is raised on a non-existing token", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    await truffleAssert.fails(
      // tokenId 0 doesn't exist
      token.raiseDispute(0, {
        from: accounts[1],
        value: 1
      }),
      truffleAssert.ErrorType.REVERT
    );
  });
  it("should revert if arbitration price is not paid", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
    const tokenURI = "0x" + Buffer.from(hash, "utf8").toString("hex");
    const addresses = [accounts[0]];

    await token.mint(addresses, tokenURI, {
      from: accounts[0]
    });
    const tokenId = parseInt(await token.totalSupply(), 10) - 1;
    await truffleAssert.fails(
      token.raiseDispute(tokenId, {
        from: accounts[1],
        // min price is 1
        value: 0
      }),
      truffleAssert.ErrorType.REVERT
    );
  });
  it("should revert if owner raises dispute on own token", async () => {
    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
    const tokenURI = "0x" + Buffer.from(hash, "utf8").toString("hex");
    const addresses = [accounts[0]];

    await token.mint(addresses, tokenURI, {
      from: accounts[0]
    });
    const tokenId = parseInt(await token.totalSupply(), 10) - 1;
    await truffleAssert.fails(
      token.raiseDispute(tokenId, {
        // owner raises dispute on own token
        from: accounts[0],
        value: 1
      }),
      truffleAssert.ErrorType.REVERT
    );
  });
});

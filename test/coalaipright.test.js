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
  it("should execute a ruling in favor of the prosecutor", async () => {
    // NOTE: We'd like to test for the "Ruling" event here. However,
    // truffleAssertions doesn't record this event when one contract is calling
    // another.
    const owner = accounts[0];
    const defendant = accounts[1];
    const prosecutor = accounts[2];

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
    const addresses = [defendant];

    await token.mint(addresses, tokenURI, {
      from: defendant
    });
    const tokenId = parseInt(await token.totalSupply(), 10) - 1;
    await token.raiseDispute(tokenId, {
      from: prosecutor,
      value: 1
    });

    const disputeId =
      (await arbitrator.getDisputesLength.call({ from: owner })) - 1;

    // Rule in favor of the prosecutor
    await arbitrator.giveRuling(disputeId, 0, { from: owner });
    // Token doesn't exist anymore
    assert(!(await token.exists(tokenId, { from: owner })));
    const rightsConflictId = await token.disputeIDtoRightsConflictID(
      disputeId,
      { from: owner }
    );
    const status = (await token.rightConflicts.call(rightsConflictId, {
      from: owner
    }))[5];
    // Status is set to resolved
    assert.equal(status, 1);
  });
  it("should execute a ruling in favor of the defendant", async () => {
    // NOTE: We'd like to test for the "Ruling" event here. However,
    // truffleAssertions doesn't record this event when one contract is calling
    // another.
    const owner = accounts[0];
    const defendant = accounts[1];
    const prosecutor = accounts[2];

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
    const addresses = [defendant];

    await token.mint(addresses, tokenURI, {
      from: defendant
    });
    const tokenId = parseInt(await token.totalSupply(), 10) - 1;
    await token.raiseDispute(tokenId, {
      from: prosecutor,
      value: 1
    });

    const disputeId =
      (await arbitrator.getDisputesLength.call({ from: owner })) - 1;

    // Rule in favor of the defendant
    await arbitrator.giveRuling(disputeId, 1, { from: owner });
    // Token exists
    assert(await token.exists(tokenId, { from: owner }));
    // Defendant was transferred back their token
    assert(await token.ownerOf(tokenId, { from: owner }), defendant);
    const rightsConflictId = await token.disputeIDtoRightsConflictID(
      disputeId,
      { from: owner }
    );
    const status = (await token.rightConflicts.call(rightsConflictId, {
      from: owner
    }))[5];
    // Status is set to resolved
    assert.equal(status, 1);
    // Approval for msg.sender should be cleared again
    assert.equal(await token.getApproved(tokenId), 0x0);
  });
  it("should revert if intruder tries to give ruling", async () => {
    const owner = accounts[0];
    const defendant = accounts[1];
    const prosecutor = accounts[2];
    const intruder = accounts[3];

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
    const addresses = [defendant];

    await token.mint(addresses, tokenURI, {
      from: defendant
    });
    const tokenId = parseInt(await token.totalSupply(), 10) - 1;
    await token.raiseDispute(tokenId, {
      from: prosecutor,
      value: 1
    });

    const disputeId =
      (await arbitrator.getDisputesLength.call({ from: owner })) - 1;

    // Intruder tries calling rule function
    await truffleAssert.fails(
      token.rule(disputeId, 1, { from: intruder }),
      truffleAssert.ErrorType.REVERT
    );
    // Token is still in the hand of the COALA IP contract
    assert(await token.ownerOf(tokenId, { from: owner }), token.address);
    const rightsConflictId = await token.disputeIDtoRightsConflictID(
      disputeId,
      { from: owner }
    );
    const status = (await token.rightConflicts.call(rightsConflictId, {
      from: owner
    }))[5];
    // Status is unresolved
    assert.equal(status, 0);
  });
  it("should revert if ruling is given twice on same dispute", async () => {
    const owner = accounts[0];
    const defendant = accounts[1];
    const prosecutor = accounts[2];

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
    const addresses = [defendant];

    await token.mint(addresses, tokenURI, {
      from: defendant
    });
    const tokenId = parseInt(await token.totalSupply(), 10) - 1;
    await token.raiseDispute(tokenId, {
      from: prosecutor,
      value: 1
    });

    const disputeId =
      (await arbitrator.getDisputesLength.call({ from: owner })) - 1;

    // Give ruling in favor of the defendant
    await arbitrator.giveRuling(disputeId, 1, { from: owner });
    // Token was transferred to defendant
    assert(await token.ownerOf(tokenId, { from: owner }), defendant);
    const rightsConflictId = await token.disputeIDtoRightsConflictID(
      disputeId,
      { from: owner }
    );
    const status = (await token.rightConflicts.call(rightsConflictId, {
      from: owner
    }))[5];
    // Status was marked resolved
    assert.equal(status, 1);
    // Give ruling again
    await truffleAssert.fails(
      arbitrator.giveRuling(disputeId, 1, { from: owner }),
      truffleAssert.ErrorType.REVERT
    );
  });
  it("should revert if ruling doesn't exist in COALA IP contract", async () => {
    const owner = accounts[0];
    const defendant = accounts[1];
    const prosecutor = accounts[2];
    const intruder = accounts[3];

    const arbitrator = await CentralizedArbitrator.new(arbitration.price);
    const token = await CoalaIPRight.new(
      "CoalaIP Right",
      "CIPR",
      "https://ipfs.infura.io/ipfs/",
      arbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
    const choices = 3;
    await arbitrator.createDispute(choices, arbitration.extraData, {
      from: intruder,
      value: 1
    });
    const disputeId =
      (await arbitrator.getDisputesLength.call({ from: owner })) - 1;
    await truffleAssert.fails(
      arbitrator.giveRuling(disputeId, 1, { from: owner }),
      truffleAssert.ErrorType.REVERT
    );
  });
});

// @format
const truffleAssert = require("truffle-assertions");

var COALAIPAttestation = artifacts.require(
  "./build/contracts/COALAIPAttestation"
);

contract("COALA IP Attestation", accounts => {
  it("should create a new attestation", async () => {
    const URI = "http://example.com/attestation";
    const URI2 = "http://example.com/attestation2";
    const attestation = await COALAIPAttestation.new();

    const result1 = await attestation.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    const result2 = await attestation.create(1, URI2, {
      from: accounts[1],
      value: 10000000000000001
    });

    assert.equal(await attestation.attestationURI(0), URI);
    assert.equal(await attestation.attestationURI(1), URI2);
    assert.equal(await attestation.totalSupply(), 2);
    assert.equal(await attestation.exists(0), true);
    assert.equal(await attestation.exists(1), true);
    assert.equal(await attestation.exists(2), false);
    assert.equal(await attestation.ownerOf(0), accounts[0]);
    assert.equal(await attestation.ownerOf(1), accounts[1]);
    assert.equal(await attestation.stakeOfAttestation(0), 10000000000000000);
    assert.equal(await attestation.stakeOfAttestation(1), 10000000000000001);

    truffleAssert.eventEmitted(result1, "Create", ev => {
      return (
        ev._creator === accounts[0] &&
        ev._attestationId.toNumber() === 0 &&
        ev._tokenId.toNumber() === 0
      );
    });
    truffleAssert.eventEmitted(result2, "Create", ev => {
      return (
        ev._creator === accounts[1] &&
        ev._attestationId.toNumber() === 1 &&
        ev._tokenId.toNumber() === 1
      );
    });
  });

  it("should create a new attestation and allow to withdraw", async () => {
    const URI = "http://example.com/attestation";
    const URI2 = "http://example.com/attestation2";
    const attestation = await COALAIPAttestation.new();

    const result1 = await attestation.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    await attestation.create(0, URI2, {
      from: accounts[1],
      value: 10000000000000001
    });
    const result2 = await attestation.withdraw(0, { from: accounts[0] });

    assert.equal((await attestation.totalSupply()).toNumber(), 1);

    truffleAssert.reverts(attestation.attestationURI(0));
    truffleAssert.reverts(attestation.ownerOf(0));
    truffleAssert.reverts(attestation.stakeOfAttestation(0));
    assert.equal(await attestation.exists(0), false);

    assert.equal(await attestation.attestationURI(1), URI2);
    assert.equal(await attestation.ownerOf(1), accounts[1]);
    assert.equal(await attestation.stakeOfAttestation(1), 10000000000000001);
    assert.equal(await attestation.exists(1), true);

    truffleAssert.eventEmitted(result2, "Withdraw", ev => {
      return (
        ev._withdrawer === accounts[0] &&
        ev._attestationId.toNumber() === 0 &&
        ev._tokenId.toNumber() === 0
      );
    });
  });

  it("should set the minimum stake", async () => {
    const URI = "http://example.com/attestation";
    const attestation = await COALAIPAttestation.new();

    await attestation.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    assert.equal((await attestation.totalSupply()).toNumber(), 1);
    assert.equal(await attestation.attestationURI(0), URI);
    assert.equal(await attestation.ownerOf(0), accounts[0]);
    assert.equal(await attestation.stakeOfAttestation(0), 10000000000000000);
    assert.equal(await attestation.exists(0), true);

    attestation.setStake(100, {
      from: accounts[0]
    });

    await attestation.create(0, URI, {
      from: accounts[0],
      value: 100
    });
    assert.equal((await attestation.totalSupply()).toNumber(), 2);
    assert.equal(await attestation.attestationURI(1), URI);
    assert.equal(await attestation.ownerOf(1), accounts[0]);
    assert.equal(await attestation.stakeOfAttestation(1), 100);
    assert.equal(await attestation.exists(1), true);
  });

  it("should fail withdrawing twice", async () => {
    const URI = "http://example.com/attestation";
    const attestation = await COALAIPAttestation.new();

    await attestation.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    await attestation.withdraw(0, { from: accounts[0] });
    truffleAssert.reverts(attestation.withdraw(0, { from: accounts[0] }));
  });

  it("should fail with the wrong account withdrawing", async () => {
    const URI = "http://example.com/attestation";
    const attestation = await COALAIPAttestation.new();

    await attestation.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    truffleAssert.reverts(attestation.withdraw(0, { from: accounts[1] }));
  });

  it("it should fail staking an attestation", async () => {
    const URI = "http://example.com/attestation";
    const attestation = await COALAIPAttestation.new();

    truffleAssert.reverts(
      attestation.create(0, URI, {
        from: accounts[0],
        value: 9999999999999999
      })
    );
  });
});

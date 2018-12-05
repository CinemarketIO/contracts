// @format
const truffleAssert = require("truffle-assertions");

var COALAIPAssertion = artifacts.require("./build/contracts/COALAIPAssertion");

contract("COALA IP Assertion", accounts => {
  it("should create a new assertion", async () => {
    const URI = "http://example.com/assertion";
    const URI2 = "http://example.com/assertion2";
    const assertion = await COALAIPAssertion.new();

    const result1 = await assertion.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    const result2 = await assertion.create(1, URI2, {
      from: accounts[1],
      value: 10000000000000001
    });

    assert.equal(await assertion.assertionURI(0), URI);
    assert.equal(await assertion.assertionURI(1), URI2);
    assert.equal(await assertion.totalSupply(), 2);
    assert.equal(await assertion.exists(0), true);
    assert.equal(await assertion.exists(1), true);
    assert.equal(await assertion.exists(2), false);
    assert.equal(await assertion.ownerOf(0), accounts[0]);
    assert.equal(await assertion.ownerOf(1), accounts[1]);
    assert.equal(await assertion.stakeOfAssertion(0), 10000000000000000);
    assert.equal(await assertion.stakeOfAssertion(1), 10000000000000001);

    truffleAssert.eventEmitted(result1, "Create", ev => {
      return (
        ev._creator === accounts[0] &&
        ev._assertionId.toNumber() === 0 &&
        ev._tokenId.toNumber() === 0
      );
    });
    truffleAssert.eventEmitted(result2, "Create", ev => {
      return (
        ev._creator === accounts[1] &&
        ev._assertionId.toNumber() === 1 &&
        ev._tokenId.toNumber() === 1
      );
    });
  });

  it("should create a new assertion and allow to withdraw", async () => {
    const URI = "http://example.com/assertion";
    const URI2 = "http://example.com/assertion2";
    const assertion = await COALAIPAssertion.new();

    const result1 = await assertion.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    await assertion.create(0, URI2, {
      from: accounts[1],
      value: 10000000000000001
    });
    const result2 = await assertion.withdraw(0, { from: accounts[0] });

    assert.equal((await assertion.totalSupply()).toNumber(), 1);

    truffleAssert.reverts(assertion.assertionURI(0));
    truffleAssert.reverts(assertion.ownerOf(0));
    truffleAssert.reverts(assertion.stakeOfAssertion(0));
    assert.equal(await assertion.exists(0), false);

    assert.equal(await assertion.assertionURI(1), URI2);
    assert.equal(await assertion.ownerOf(1), accounts[1]);
    assert.equal(await assertion.stakeOfAssertion(1), 10000000000000001);
    assert.equal(await assertion.exists(1), true);

    truffleAssert.eventEmitted(result2, "Withdraw", ev => {
      return (
        ev._withdrawer === accounts[0] &&
        ev._assertionId.toNumber() === 0 &&
        ev._tokenId.toNumber() === 0
      );
    });
  });

  it("should set the minimum stake", async () => {
    const URI = "http://example.com/assertion";
    const assertion = await COALAIPAssertion.new();

    await assertion.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    assert.equal((await assertion.totalSupply()).toNumber(), 1);
    assert.equal(await assertion.assertionURI(0), URI);
    assert.equal(await assertion.ownerOf(0), accounts[0]);
    assert.equal(await assertion.stakeOfAssertion(0), 10000000000000000);
    assert.equal(await assertion.exists(0), true);

    assertion.setStake(100, {
      from: accounts[0]
    });

    await assertion.create(0, URI, {
      from: accounts[0],
      value: 100
    });
    assert.equal((await assertion.totalSupply()).toNumber(), 2);
    assert.equal(await assertion.assertionURI(1), URI);
    assert.equal(await assertion.ownerOf(1), accounts[0]);
    assert.equal(await assertion.stakeOfAssertion(1), 100);
    assert.equal(await assertion.exists(1), true);
  });

  it("should fail withdrawing twice", async () => {
    const URI = "http://example.com/assertion";
    const assertion = await COALAIPAssertion.new();

    await assertion.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    await assertion.withdraw(0, { from: accounts[0] });
    truffleAssert.reverts(assertion.withdraw(0, { from: accounts[0] }));
  });

  it("should fail with the wrong account withdrawing", async () => {
    const URI = "http://example.com/assertion";
    const assertion = await COALAIPAssertion.new();

    await assertion.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    truffleAssert.reverts(assertion.withdraw(0, { from: accounts[1] }));
  });

  it("it should fail staking an assertion", async () => {
    const URI = "http://example.com/assertion";
    const assertion = await COALAIPAssertion.new();

    truffleAssert.reverts(
      assertion.create(0, URI, {
        from: accounts[0],
        value: 9999999999999999
      })
    );
  });
});

// @format
const truffleAssert = require("truffle-assertions");

var COALAIPRightsConflict = artifacts.require(
  "./build/contracts/COALAIPRightsConflict"
);

contract("COALA IP RightsConflict", accounts => {
  it("should create a new rightsConflict", async () => {
    const URI = "http://example.com/rightsConflict";
    const URI2 = "http://example.com/rightsConflict2";
    const rightsConflict = await COALAIPRightsConflict.new();

    const result1 = await rightsConflict.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    const result2 = await rightsConflict.create(1, URI2, {
      from: accounts[1],
      value: 10000000000000001
    });

    assert.equal(await rightsConflict.rightsConflictURI(0), URI);
    assert.equal(await rightsConflict.rightsConflictURI(1), URI2);
    assert.equal(await rightsConflict.totalSupply(), 2);
    assert.equal(await rightsConflict.exists(0), true);
    assert.equal(await rightsConflict.exists(1), true);
    assert.equal(await rightsConflict.exists(2), false);
    assert.equal(await rightsConflict.ownerOf(0), accounts[0]);
    assert.equal(await rightsConflict.ownerOf(1), accounts[1]);
    assert.equal(
      await rightsConflict.stakeOfRightsConflict(0),
      10000000000000000
    );
    assert.equal(
      await rightsConflict.stakeOfRightsConflict(1),
      10000000000000001
    );

    truffleAssert.eventEmitted(result1, "Create", ev => {
      return (
        ev._creator === accounts[0] &&
        ev._rightsConflictId.toNumber() === 0 &&
        ev._tokenId.toNumber() === 0
      );
    });
    truffleAssert.eventEmitted(result2, "Create", ev => {
      return (
        ev._creator === accounts[1] &&
        ev._rightsConflictId.toNumber() === 1 &&
        ev._tokenId.toNumber() === 1
      );
    });
  });

  it("should create a new rightsConflict and allow to withdraw", async () => {
    const URI = "http://example.com/rightsConflict";
    const URI2 = "http://example.com/rightsConflict2";
    const rightsConflict = await COALAIPRightsConflict.new();

    const result1 = await rightsConflict.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    await rightsConflict.create(0, URI2, {
      from: accounts[1],
      value: 10000000000000001
    });
    const result2 = await rightsConflict.withdraw(0, { from: accounts[0] });

    assert.equal((await rightsConflict.totalSupply()).toNumber(), 1);

    truffleAssert.reverts(rightsConflict.rightsConflictURI(0));
    truffleAssert.reverts(rightsConflict.ownerOf(0));
    truffleAssert.reverts(rightsConflict.stakeOfRightsConflict(0));
    assert.equal(await rightsConflict.exists(0), false);

    assert.equal(await rightsConflict.rightsConflictURI(1), URI2);
    assert.equal(await rightsConflict.ownerOf(1), accounts[1]);
    assert.equal(
      await rightsConflict.stakeOfRightsConflict(1),
      10000000000000001
    );
    assert.equal(await rightsConflict.exists(1), true);

    truffleAssert.eventEmitted(result2, "Withdraw", ev => {
      return (
        ev._withdrawer === accounts[0] &&
        ev._rightsConflictId.toNumber() === 0 &&
        ev._tokenId.toNumber() === 0
      );
    });
  });

  it("should set the minimum stake", async () => {
    const URI = "http://example.com/rightsConflict";
    const rightsConflict = await COALAIPRightsConflict.new();

    await rightsConflict.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    assert.equal((await rightsConflict.totalSupply()).toNumber(), 1);
    assert.equal(await rightsConflict.rightsConflictURI(0), URI);
    assert.equal(await rightsConflict.ownerOf(0), accounts[0]);
    assert.equal(
      await rightsConflict.stakeOfRightsConflict(0),
      10000000000000000
    );
    assert.equal(await rightsConflict.exists(0), true);

    rightsConflict.setStake(100, {
      from: accounts[0]
    });

    await rightsConflict.create(0, URI, {
      from: accounts[0],
      value: 100
    });
    assert.equal((await rightsConflict.totalSupply()).toNumber(), 2);
    assert.equal(await rightsConflict.rightsConflictURI(1), URI);
    assert.equal(await rightsConflict.ownerOf(1), accounts[0]);
    assert.equal(await rightsConflict.stakeOfRightsConflict(1), 100);
    assert.equal(await rightsConflict.exists(1), true);
  });

  it("should fail withdrawing twice", async () => {
    const URI = "http://example.com/rightsConflict";
    const rightsConflict = await COALAIPRightsConflict.new();

    await rightsConflict.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    await rightsConflict.withdraw(0, { from: accounts[0] });
    truffleAssert.reverts(rightsConflict.withdraw(0, { from: accounts[0] }));
  });

  it("should fail with the wrong account withdrawing", async () => {
    const URI = "http://example.com/rightsConflict";
    const rightsConflict = await COALAIPRightsConflict.new();

    await rightsConflict.create(0, URI, {
      from: accounts[0],
      value: 10000000000000000
    });
    truffleAssert.reverts(rightsConflict.withdraw(0, { from: accounts[1] }));
  });

  it("it should fail staking an rightsConflict", async () => {
    const URI = "http://example.com/rightsConflict";
    const rightsConflict = await COALAIPRightsConflict.new();

    truffleAssert.reverts(
      rightsConflict.create(0, URI, {
        from: accounts[0],
        value: 9999999999999999
      })
    );
  });
});

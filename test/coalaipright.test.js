// @format
const truffleAssert = require("truffle-assertions");

var CoalaIPRight = artifacts.require("./build/contracts/COALAIPRight");

contract("COALA IP Right", function(accounts) {
  it("should create a new token", async () => {
    const token = await CoalaIPRight.new("CoalaIP Right", "CIPR");
    const tokenURI = "https://example.com/0";
    const tokenURIs = [tokenURI];
    const addresses = [accounts[0]];

    const res = await token.mint(addresses.join(","), tokenURIs.join(","), {
      from: accounts[0]
    });

    assert.equal(await token.balanceOf(addresses[0]), 1);
    assert.equal(await token.tokenURI(0), "https://example.com/0");
    truffleAssert.eventEmitted(res, "Transfer", ev => {
      return ev._to === addresses[0];
    });
  });
  it("should create 10 new tokens", async () => {
    const token = await CoalaIPRight.new("CoalaIP Right", "CIPR");
    const tokenURIs = [];
    for (let i = 0; i < 10; i++) {
      tokenURIs.push(`https://example.com/${i}`);
    }
    await token.mint(accounts.join(","), tokenURIs.join(","), {
      from: accounts[0]
    });
    for (let i = 0; i < 10; i++) {
      assert.equal(await token.balanceOf(accounts[i]), 1);
      assert.equal(await token.tokenURI(i), `https://example.com/${i}`);
    }
  });
});

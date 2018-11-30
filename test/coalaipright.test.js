// @format
const truffleAssert = require("truffle-assertions");

var CoalaIPRight = artifacts.require("./build/contracts/COALAIPRight");

contract("COALA IP Right", function(accounts) {
  it("should create a new token contract and a mint a token", async () => {
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

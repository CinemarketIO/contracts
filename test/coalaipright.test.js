// @format
const truffleAssert = require("truffle-assertions");

var CoalaIPRight = artifacts.require("./build/contracts/COALAIPRight");

contract("COALA IP Right", function(accounts) {
  it("should create a single token", async () => {
    const token = await CoalaIPRight.new("CoalaIP Right", "CIPR");
    const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
    const tokenURI = "0x" + Buffer.from(hash, "utf8").toString("hex");
    const addresses = [accounts[0]];

    const res = await token.mint(addresses, tokenURI, {
      from: accounts[0]
    });

    const ipfsProvider = await token.ipfsProvider.call();
    assert.equal(await token.balanceOf(addresses[0]), 1);
    assert.equal(await token.tokenURI(0), ipfsProvider + hash);
    assert.equal(await token.ownerOf(0), addresses[0]);
    truffleAssert.eventEmitted(res, "Transfer", ev => {
      return ev._to === addresses[0];
    });
  });
  it("should create 10 new tokens", async () => {
    const token = await CoalaIPRight.new("CoalaIP Right", "CIPR");
    const hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t";
    let tokenURIs = "";
    for (let i = 0; i < 10; i++) {
      tokenURIs += hash;
      if (i !== 9) {
        tokenURIs += ":";
      }
    }
    tokenURIs = "0x" + Buffer.from(tokenURIs, "utf8").toString("hex");

    console.log(accounts.length, tokenURIs);
    await token.mint(accounts, tokenURIs, {
      from: accounts[0]
    });
    const ipfsProvider = await token.ipfsProvider.call();
    for (let i = 0; i < 10; i++) {
      assert.equal(await token.balanceOf(accounts[i]), 1);
      assert.equal(await token.tokenURI(i), `${ipfsProvider}${hash}`);
    }
  });
});

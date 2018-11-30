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

  it("should not execute transferFrom", async () => {
    const token = await CoalaIPRight.new("CoalaIP Right", "CIPR");
    await truffleAssert.fails(
      token.transferFrom(accounts[0], accounts[1], 0),
      truffleAssert.ErrorType.REVERT
    );
  });

  it("should not execute safeTransferFrom", async () => {
    const token = await CoalaIPRight.new("CoalaIP Right", "CIPR");
    await truffleAssert.fails(
      token.safeTransferFrom(accounts[0], accounts[1], 0),
      truffleAssert.ErrorType.REVERT
    );
  });

  it("should not execute approve", async () => {
    const token = await CoalaIPRight.new("CoalaIP Right", "CIPR");
    await truffleAssert.fails(
      token.approve(accounts[0], 0),
      truffleAssert.ErrorType.REVERT
    );
  });

  it("should not execute approve", async () => {
    const token = await CoalaIPRight.new("CoalaIP Right", "CIPR");
    await truffleAssert.fails(
      token.setApprovalForAll(accounts[0], true),
      truffleAssert.ErrorType.REVERT
    );
  });
});

contract.skip("Truffle doesn't support feature yet", () => {
  it("should not execute safeTransferFrom with data", async () => {
    const token = await CoalaIPRight.new("CoalaIP Right", "CIPR");
    await truffleAssert.fails(
      token.safeTransferFrom["address,address,uint256,bytes"](
        accounts[0],
        accounts[1],
        0,
        "0x00012345"
      ),
      truffleAssert.ErrorType.REVERT
    );
  });
});

// @format
const CoalaIPRight = artifacts.require("./build/contracts/COALAIPRight");

module.exports = function(deployer) {
  deployer.deploy(
    CoalaIPRight,
    "COALA IP RIGHT V2",
    "CIPR V2",
    "https://ipfs.infura.io/ipfs/"
  );
};

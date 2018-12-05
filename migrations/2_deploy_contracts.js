// @format
const CoalaIPRight = artifacts.require("./build/contracts/COALAIPRight");
const COALAIPAssertion = artifacts.require(
  "./build/contracts/COALAIPAssertion"
);

module.exports = function(deployer) {
  deployer.deploy(CoalaIPRight, "COALA IP RIGHT V2", "CIPR V2");
  deployer.deploy(COALAIPAssertion);
};

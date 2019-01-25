// @format
const CoalaIPRight = artifacts.require("./build/contracts/COALAIPRight");
const COALAIPRightsConflict = artifacts.require(
  "./build/contracts/COALAIPRightsConflict"
);

module.exports = function(deployer) {
  deployer.deploy(CoalaIPRight, "COALA IP RIGHT V2", "CIPR V2");
};

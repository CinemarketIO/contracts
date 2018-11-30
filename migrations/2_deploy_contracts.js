// @format
const CoalaIPRight = artifacts.require("./build/contracts/CoalaIPRight");
const COALAIPAttestation = artifacts.require(
  "./build/contracts/COALAIPAttestation"
);

module.exports = function(deployer) {
  deployer.deploy(CoalaIPRight, "COALA IP RIGHT V2", "CIPR V2");
  deployer.deploy(COALAIPAttestation);
};

// @format
const CoalaIPRight = artifacts.require("./build/contracts/COALAIPRight");
// TODO: Require this from NPM?
const CentralizedArbitrator = artifacts.require(
  "./build/contracts/CentralizedArbitrator"
);

module.exports = function(deployer) {
  const arbitration = {
    price: 1,
    timeout: 1,
    extraData: "0x" + Buffer.from("abc", "utf8").toString("hex")
  };

  deployer.deploy(CentralizedArbitrator, arbitration.price).then(() => {
    return deployer.deploy(
      CoalaIPRight,
      "COALA IP RIGHT V2",
      "CIPR V2",
      "https://ipfs.infura.io/ipfs/",
      CentralizedArbitrator.address,
      arbitration.extraData,
      arbitration.timeout
    );
  });
};

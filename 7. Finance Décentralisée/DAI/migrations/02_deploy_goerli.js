const DeFiProject = artifacts.require('DeFiProject');

const daiAddress = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60"

module.exports = function (deployer, _network, accounts) {

  deployer.deploy(DeFiProject, daiAddress);

};

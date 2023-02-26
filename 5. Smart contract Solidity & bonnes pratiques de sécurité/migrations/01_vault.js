const Vault = artifacts.require('Vault');

module.exports = async (deployer) => {
    deployer.deploy(Vault);
};

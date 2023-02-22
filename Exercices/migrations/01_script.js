const SimpleStorage = artifacts.require('SimpleStorage');

module.exports = async (deployer) => {
    deployer.deploy(SimpleStorage);
};

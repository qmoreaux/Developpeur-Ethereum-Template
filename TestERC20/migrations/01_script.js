const MyToken = artifacts.require('MyToken');

module.exports = async (deployer) => {
    deployer.deploy(MyToken, 10000);
};

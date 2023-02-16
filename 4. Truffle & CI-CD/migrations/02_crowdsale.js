const Crowdsale = artifacts.require('Crowdsale');

module.exports = async (deployer) => {
    const initialSupply = '20000000000000000000000000';

    deployer.deploy(Crowdsale, initialSupply);
};

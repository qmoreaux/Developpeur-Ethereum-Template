// const ERC20Token = artifacts.require('ERC20Token');
const SendToken = artifacts.require('SendToken');

module.exports = async (deployer) => {
    const contractAddress = '0x94aBFe3d1D85DA1D42C309Bad11c904c8d7C39a1';

    deployer.deploy(SendToken, contractAddress);
};

import { ethers } from 'hardhat';

async function main() {
    const SmartStay = await ethers.getContractFactory('SmartStay');
    const smartStay = await SmartStay.deploy();

    await smartStay.deployed();

    console.log(`SmartStay deployed  at address ${smartStay.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

import hre, { ethers } from 'hardhat';
import * as fs from 'fs';
import { SmartStay, SmartStay__factory } from '../typechain-types';

async function main() {
    const filename: string = '../frontend/contracts/SmartStay.json';

    const SmartStay: SmartStay__factory = await ethers.getContractFactory('SmartStay');
    const smartStay: SmartStay = await SmartStay.deploy();

    await smartStay.deployed();

    const artifacts = await hre.artifacts.readArtifact('SmartStay');

    let fileContent: string;
    if (fs.existsSync(filename)) {
        fileContent = fs.readFileSync(filename, 'utf-8');
    } else {
        fileContent = '{}';
    }
    let fileContentJSON = JSON.parse(fileContent);
    if (fileContentJSON.abi && JSON.stringify(fileContentJSON.abi) === JSON.stringify(artifacts.abi)) {
        fileContentJSON.networks[smartStay.deployTransaction.chainId] = {
            address: smartStay.address,
            transactionHash: smartStay.deployTransaction.hash
        };
    } else {
        fileContentJSON = {
            abi: artifacts.abi,
            networks: {}
        };
        fileContentJSON.networks[smartStay.deployTransaction.chainId] = {
            address: smartStay.address,
            transactionHash: smartStay.deployTransaction.hash
        };
    }

    fs.writeFileSync(filename, JSON.stringify(fileContentJSON));

    console.log(`SmartStay deployed  at address ${smartStay.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

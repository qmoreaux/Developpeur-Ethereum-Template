import hre, { ethers } from 'hardhat';
import * as fs from 'fs';
// import { SmartStayRenting, SmartStayRenting__factory } from '../typechain-types';

const filename: string = '../frontend/contracts/SmartStay.json';

let fileContent: string;
let fileContentJSON: any;
if (fs.existsSync(filename)) {
    fileContent = fs.readFileSync(filename, 'utf-8');
} else {
    fileContent = '{}';
}
fileContentJSON = JSON.parse(fileContent);

async function main() {
    await deployRenting();

    fs.writeFileSync(filename, JSON.stringify(fileContentJSON));
}

const deployRenting = async () => {
    const SmartStayRenting = await ethers.getContractFactory('SmartStayRenting');
    const smartStayRenting = await SmartStayRenting.deploy();
    await smartStayRenting.deployed();

    const artifacts = await hre.artifacts.readArtifact('SmartStayRenting');

    if (!fileContentJSON.SmartStayRenting) {
        fileContentJSON = { ...fileContentJSON, SmartStayRenting: {} };
    }
    if (
        !fileContentJSON.SmartStayRenting.abi ||
        JSON.stringify(fileContentJSON.SmartStayRenting.abi) !== JSON.stringify(artifacts.abi)
    ) {
        fileContentJSON.SmartStayRenting = {
            abi: artifacts.abi,
            networks: {}
        };
    }
    fileContentJSON.SmartStayRenting.networks[smartStayRenting.deployTransaction.chainId] = {
        address: smartStayRenting.address,
        transactionHash: smartStayRenting.deployTransaction.hash
    };

    console.log(`SmartStayRenting deployed  at address ${smartStayRenting.address}`);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

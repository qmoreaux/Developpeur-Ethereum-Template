import hre, { ethers } from 'hardhat';
import * as fs from 'fs';
import {
    SmartStayRenting,
    SmartStayRenting__factory,
    SmartStayBooking,
    SmartStayBooking__factory
} from '../typechain-types';

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
    const address = await deployRenting();
    await deployBooking(address);

    fs.writeFileSync(filename, JSON.stringify(fileContentJSON));
}

const deployRenting = async () => {
    const SmartStayRenting: SmartStayRenting__factory = await ethers.getContractFactory('SmartStayRenting');
    const smartStayRenting: SmartStayRenting = await SmartStayRenting.deploy();
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

    return smartStayRenting.address;
};

const deployBooking = async (address: string) => {
    const SmartStayBooking: SmartStayBooking__factory = await ethers.getContractFactory('SmartStayBooking');
    const smartStayBooking: SmartStayBooking = await SmartStayBooking.deploy(address);
    await smartStayBooking.deployed();

    const artifacts = await hre.artifacts.readArtifact('SmartStayBooking');

    if (!fileContentJSON.SmartStayBooking) {
        fileContentJSON = { ...fileContentJSON, SmartStayBooking: {} };
    }
    if (
        !fileContentJSON.SmartStayBooking.abi ||
        JSON.stringify(fileContentJSON.SmartStayBooking.abi) !== JSON.stringify(artifacts.abi)
    ) {
        fileContentJSON.SmartStayBooking = {
            abi: artifacts.abi,
            networks: {}
        };
    }
    fileContentJSON.SmartStayBooking.networks[smartStayBooking.deployTransaction.chainId] = {
        address: smartStayBooking.address,
        transactionHash: smartStayBooking.deployTransaction.hash
    };

    console.log(`SmartStayBooking deployed  at address ${smartStayBooking.address}`);

    return smartStayBooking.address;
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

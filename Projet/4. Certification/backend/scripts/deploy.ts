import { ethers } from 'hardhat';
import * as fs from 'fs';
import { SmartStay, SmartStay__factory } from '../typechain-types';

async function main() {
    const filename: string = '../frontend/contracts/SmartStay.json';

    const SmartStay: SmartStay__factory = await ethers.getContractFactory('SmartStay');
    const smartStay: SmartStay = await SmartStay.deploy();

    await smartStay.deployed();

    let fileContent: string;
    if (fs.existsSync(filename)) {
        fileContent = fs.readFileSync(filename, 'utf-8');
    } else {
        fileContent = '{}';
    }
    let fileContentJSON = JSON.parse(fileContent);

    fileContentJSON[smartStay.deployTransaction.chainId] = {
        address: smartStay.address,
        abi: JSON.parse(smartStay.interface.format('json').toString())
    };

    fs.writeFileSync(filename, JSON.stringify(fileContentJSON));

    console.log(`SmartStay deployed  at address ${smartStay.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

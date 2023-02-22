const SimpleStorage = artifacts.require('./SimpleStorage.sol');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('SimpleStorage', async (accounts) => {
    const numberToStore = 1;
    const numberFail = 9;

    before(async function () {
        simpleStorageInstance = await SimpleStorage.deployed();
    });

    it('should store a number', async () => {
        const storeNumber = await simpleStorageInstance.store(numberToStore);

        expect(await simpleStorageInstance.retrieve()).to.be.bignumber.equal(BN(numberToStore));
        expectEvent(storeNumber, 'NumberSet', {
            number: BN(numberToStore)
        });
    });

    // it('should not store a number bigger than 2', async () => {
    //     await expectRevert(simpleStorageInstance.store(numberFail), expectRevert.unspecified);
    // });
});

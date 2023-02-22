const SimpleStorage = artifacts.require('./SimpleStorage.sol');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('SimpleStorage', async (accounts) => {
    const numberToStore = 20;
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

    it('should fail to store a number', async () => {
        await expectRevert(simpleStorageInstance.store(numberFail), 'Num must be greater than 10');
    });

});

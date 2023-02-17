const SimpleStorage = artifacts.require('./SimpleStorage.sol');

const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const constants = require('@openzeppelin/test-helpers/src/constants');

contract('SimpleStorage', (accounts) => {
    it('...should store the value 89.', async () => {
        const simpleStorageInstance = await SimpleStorage.deployed();

        // Set value of 89
        await simpleStorageInstance.set(89, { from: accounts[0] });

        // Get stored value
        const storedData = await simpleStorageInstance.get.call();

        assert.equal(storedData, 89, 'The value 89 was not stored.');
    });
});

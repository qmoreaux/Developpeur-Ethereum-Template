const Voting = artifacts.require('./Voting.sol');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', (accounts) => {
    const _owner = accounts[0];

    let votingInstance;

    beforeEach(async function () {
        votingInstance = await Voting.new({ from: _owner });
    });

    it('', async () => {});
});

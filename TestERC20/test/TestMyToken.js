const MyToken = artifacts.require('./MyToken.sol');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('MyToken', (accounts) => {
    const _name = 'Alyra';
    const _symbol = 'ALY';
    const _initialSupply = new BN(10000);
    const _owner = accounts[0];
    const _recipient = accounts[1];
    const _decimal = new BN(18);

    let MyTokenInstance;

    beforeEach(async function () {
        MyTokenInstance = await MyToken.new(_initialSupply, { from: _owner });
    });

    it('has a name', async () => {
        expect(await MyTokenInstance.name()).to.equal(_name);
    });

    it('has a symbol', async () => {
        expect(await MyTokenInstance.symbol()).to.equal(_symbol);
    });

    it('has a decimal', async () => {
        expect(await MyTokenInstance.decimals()).to.be.bignumber.equal(_decimal);
    });

    it('check first balance', async () => {
        expect(await MyTokenInstance.balanceOf(_owner)).to.be.bignumber.equal(_initialSupply);
    });

    it('check balance after transfer', async () => {
        let amount = new BN(100);
        let balanceOwnerBeforeTransfer = await MyTokenInstance.balanceOf(_owner);
        let balanceRecipientBeforeTransfer = await MyTokenInstance.balanceOf(_recipient);

        expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));

        await MyTokenInstance.transfer(_recipient, new BN(100), { from: _owner });

        let balanceOwnerAfterTransfer = await MyTokenInstance.balanceOf(_owner);
        let balanceRecipientAfterTransfer = await MyTokenInstance.balanceOf(_recipient);

        expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
        expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
    });

    it('should check approve allowance', async () => {
        let amount = new BN(100);
        let allowanceBeforeApproval = await MyTokenInstance.allowance(_owner, _recipient);

        expect(allowanceBeforeApproval).to.be.bignumber.equal(new BN(0));

        await MyTokenInstance.approve(_recipient, amount);

        let allowanceAfterApproval = await MyTokenInstance.allowance(_owner, _recipient);
        expect(allowanceAfterApproval).to.be.bignumber.equal(amount);
    });

    it('should check transferFrom', async () => {
        let amount = new BN(100);
        let balanceOwnerBeforeTransfer = await MyTokenInstance.balanceOf(_owner);
        let balanceRecipientBeforeTransfer = await MyTokenInstance.balanceOf(_recipient);

        await MyTokenInstance.approve(_recipient, amount);
        await MyTokenInstance.transferFrom(_owner, _recipient, amount, { from: _recipient });

        let balanceOwnerAfterTransfer = await MyTokenInstance.balanceOf(_owner);
        let balanceRecipientAfterTransfer = await MyTokenInstance.balanceOf(_recipient);

        expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
        expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
    });
});

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SmartStayNFTMarketplaceTest', () => {
    let smartStayNFTCollection: any;
    let smartStayMarketplace: any;
    let owner: any;
    let addr1: any;

    const deploySmartStayFixture = async () => {
        const [_owner, _addr1] = await ethers.getSigners();
        const _SmartStayNFTCollection = await ethers.getContractFactory('SmartStayNFTCollection');
        const _smartStayNFTCollection = await _SmartStayNFTCollection.deploy();
        const instance = await _smartStayNFTCollection.deployed();

        const _SmartStayMarketplace = await ethers.getContractFactory('SmartStayMarketplace');
        const _smartStayMarketplace = await _SmartStayMarketplace.deploy(instance.address);

        return { _smartStayNFTCollection, _smartStayMarketplace, _owner, _addr1 };
    };

    describe('List token', async () => {
        beforeEach(async () => {
            const { _smartStayNFTCollection, _smartStayMarketplace, _owner, _addr1 } = await loadFixture(
                deploySmartStayFixture
            );
            smartStayNFTCollection = _smartStayNFTCollection;
            smartStayMarketplace = _smartStayMarketplace;
            owner = _owner;
            addr1 = _addr1;

            await smartStayNFTCollection.mint(owner.address, 'https://metadataURI');
            await smartStayNFTCollection.mint(owner.address, 'https://metadataURI2');
            await smartStayNFTCollection.mint(owner.address, 'https://metadataURI3');

            await smartStayNFTCollection.mint(addr1.address, 'https://metadataURI2');

            await smartStayNFTCollection.approve(smartStayMarketplace.address, 2);
            await smartStayNFTCollection.approve(smartStayMarketplace.address, 3);
            await smartStayNFTCollection.connect(addr1).approve(smartStayMarketplace.address, 4);
        });

        it('Should list a NFT and check it is correctly listed', async () => {
            await smartStayMarketplace.listToken(2, ethers.utils.parseUnits('1', 'ether'));

            const listedNFT = await smartStayMarketplace.getToken(2);

            expect(listedNFT.tokenID).to.be.equal(2);
            expect(listedNFT.owner).to.be.equal(owner.address);
            expect(listedNFT.price).to.be.equal(ethers.utils.parseUnits('1', 'ether'));
        });

        it('Should list two NFT and check getListedNFT returns the correct tokens', async () => {
            await smartStayMarketplace.listToken(2, ethers.utils.parseUnits('1', 'ether'));
            await smartStayMarketplace.connect(addr1).listToken(4, ethers.utils.parseUnits('2', 'ether'));

            const listedNFTList = await smartStayMarketplace.getListedNFT();

            expect(listedNFTList.length).to.be.equal(2);
            expect(listedNFTList[0].tokenID).to.be.equal(2);
            expect(listedNFTList[0].owner).to.be.equal(owner.address);
            expect(listedNFTList[0].price).to.be.equal(ethers.utils.parseUnits('1', 'ether'));
            expect(listedNFTList[1].tokenID).to.be.equal(4);
            expect(listedNFTList[1].owner).to.be.equal(addr1.address);
            expect(listedNFTList[1].price).to.be.equal(ethers.utils.parseUnits('2', 'ether'));
        });

        it('Should list two NFT and check getMyListedNFT returns the correct tokens', async () => {
            await smartStayMarketplace.listToken(2, ethers.utils.parseUnits('1', 'ether'));
            await smartStayMarketplace.connect(addr1).listToken(4, ethers.utils.parseUnits('2', 'ether'));

            const listedNFTList = await smartStayMarketplace.getMyListedNFT();

            expect(listedNFTList.length).to.be.equal(1);
            expect(listedNFTList[0].tokenID).to.be.equal(2);
            expect(listedNFTList[0].owner).to.be.equal(owner.address);
            expect(listedNFTList[0].price).to.be.equal(ethers.utils.parseUnits('1', 'ether'));
        });

        it('Should list a NFT and check an event is emitted', async () => {
            await expect(smartStayMarketplace.listToken(2, ethers.utils.parseUnits('1', 'ether')))
                .to.emit(smartStayMarketplace, 'TokenListed')
                .withArgs(anyValue);
        });

        it('Should attempt to list a NFT without being the owner and expect a revert', async () => {
            await expect(
                smartStayMarketplace.connect(addr1).listToken(2, ethers.utils.parseUnits('1', 'ether'))
            ).to.be.revertedWith('SmartStay : Not owner of the token');
        });

        it('Should attempt to list a NFT without it being approved and expect a revert', async () => {
            await expect(smartStayMarketplace.listToken(1, ethers.utils.parseUnits('1', 'ether'))).to.be.revertedWith(
                'SmartStay : Token not approved'
            );
        });

        it('Should attempt to list a NFT twice and expect a revert', async () => {
            await smartStayMarketplace.listToken(2, ethers.utils.parseUnits('1', 'ether'));

            await expect(smartStayMarketplace.listToken(2, ethers.utils.parseUnits('1', 'ether'))).to.be.revertedWith(
                'SmartStay : Token already listed'
            );
        });
    });

    describe('Delist token', async () => {
        beforeEach(async () => {
            const { _smartStayNFTCollection, _smartStayMarketplace, _owner, _addr1 } = await loadFixture(
                deploySmartStayFixture
            );
            smartStayNFTCollection = _smartStayNFTCollection;
            smartStayMarketplace = _smartStayMarketplace;
            owner = _owner;
            addr1 = _addr1;

            await smartStayNFTCollection.mint(owner.address, 'https://metadataURI');
            await smartStayNFTCollection.mint(owner.address, 'https://metadataURI2');
            await smartStayNFTCollection.mint(owner.address, 'https://metadataURI3');

            await smartStayNFTCollection.mint(addr1.address, 'https://metadataURI2');

            await smartStayNFTCollection.approve(smartStayMarketplace.address, 2);
            await smartStayNFTCollection.approve(smartStayMarketplace.address, 3);
            await smartStayNFTCollection.connect(addr1).approve(smartStayMarketplace.address, 4);

            await smartStayMarketplace.listToken(2, ethers.utils.parseUnits('1', 'ether'));
            await smartStayMarketplace.listToken(3, ethers.utils.parseUnits('2', 'ether'));
            await smartStayMarketplace.connect(addr1).listToken(4, ethers.utils.parseUnits('0.1', 'ether'));
        });

        it('Should delist a NFT and check it is correctly delisted', async () => {
            await smartStayMarketplace.delistToken(2);

            const listedNFT = await smartStayMarketplace.getToken(2);

            expect(listedNFT.tokenID).to.be.equal(0);
            expect(listedNFT.owner).to.be.equal(ethers.constants.AddressZero);
            expect(listedNFT.price).to.be.equal(0);
        });

        it('Should delist two NFT and check getListedNFT returns the correct tokens', async () => {
            await smartStayMarketplace.delistToken(2);
            await smartStayMarketplace.connect(addr1).delistToken(4);

            const listedNFTList = await smartStayMarketplace.getListedNFT();

            expect(listedNFTList.length).to.be.equal(1);
        });

        it('Should delist a NFT and check getMyListedNFT returns the correct tokens', async () => {
            await smartStayMarketplace.delistToken(2);

            const listedNFTList = await smartStayMarketplace.getMyListedNFT();

            expect(listedNFTList.length).to.be.equal(1);
            expect(listedNFTList[0].tokenID).to.be.equal(3);
            expect(listedNFTList[0].owner).to.be.equal(owner.address);
            expect(listedNFTList[0].price).to.be.equal(ethers.utils.parseUnits('2', 'ether'));
        });

        it('Should delist a NFT and check an event is emitted', async () => {
            await expect(smartStayMarketplace.delistToken(2))
                .to.emit(smartStayMarketplace, 'TokenDelisted')
                .withArgs(anyValue);
        });

        it('Should attempt to delist a NFT without being the owner and expect a revert', async () => {
            await expect(smartStayMarketplace.connect(addr1).delistToken(2)).to.be.revertedWith(
                'SmartStay : Not owner of the token'
            );
        });

        it('Should attempt to delist a NFT twice and expect a revert', async () => {
            await smartStayMarketplace.delistToken(2);

            await expect(smartStayMarketplace.delistToken(2)).to.be.revertedWith('SmartStay : Token not listed');
        });
    });

    describe('Execute sale', async () => {
        beforeEach(async () => {
            const { _smartStayNFTCollection, _smartStayMarketplace, _owner, _addr1 } = await loadFixture(
                deploySmartStayFixture
            );
            smartStayNFTCollection = _smartStayNFTCollection;
            smartStayMarketplace = _smartStayMarketplace;
            owner = _owner;
            addr1 = _addr1;

            await smartStayNFTCollection.mint(owner.address, 'https://metadataURI');
            await smartStayNFTCollection.mint(owner.address, 'https://metadataURI2');

            await smartStayNFTCollection.approve(smartStayMarketplace.address, 1);
            await smartStayNFTCollection.approve(smartStayMarketplace.address, 2);

            await smartStayMarketplace.listToken(1, ethers.utils.parseUnits('1', 'ether'));
            await smartStayMarketplace.listToken(2, ethers.utils.parseUnits('2', 'ether'));
        });

        it('Should execute the sale of a NFT and check the owner is changed', async () => {
            const price = ethers.utils.parseUnits('1', 'ether');

            await smartStayMarketplace.connect(addr1).executeSale(1, { value: price });

            expect(await smartStayNFTCollection.ownerOf(1)).to.be.equal(addr1.address);
        });

        it('Should execute the sale of a NFT and check the balances are changed', async () => {
            const price = ethers.utils.parseUnits('1', 'ether');
            await smartStayMarketplace.connect(addr1).executeSale(1, { value: price });

            expect(await smartStayNFTCollection.ownerOf(1)).to.changeEtherBalances(
                [addr1, owner],
                [price.mul(-1), price]
            );
        });

        it('Should execute the sale of a NFT and check the token is delisted', async () => {
            const price = ethers.utils.parseUnits('2', 'ether');
            await smartStayMarketplace.connect(addr1).executeSale(2, { value: price });

            const listedNFT = await smartStayMarketplace.getToken(2);

            expect(listedNFT.tokenID).to.be.equal(0);
            expect(listedNFT.owner).to.be.equal(ethers.constants.AddressZero);
            expect(listedNFT.price).to.be.equal(0);
        });

        it('Should execute the sale of a NFT and check an emit is emitted', async () => {
            const price = ethers.utils.parseUnits('1', 'ether');

            await expect(smartStayMarketplace.connect(addr1).executeSale(1, { value: price }))
                .to.emit(smartStayMarketplace, 'TokenSaled')
                .withArgs(1, price, owner.address, addr1.address);
        });

        it('Should attempt to execute the sale of a NFT not listed and expect a revert', async () => {
            const price = ethers.utils.parseUnits('1', 'ether');

            await expect(smartStayMarketplace.connect(addr1).executeSale(3, { value: price })).to.be.revertedWith(
                'SmartStay : Token not listed'
            );
        });

        it('Should attempt to execute the sale of a NFT without sending the correct price and expect a revert', async () => {
            const price = ethers.utils.parseUnits('0.1', 'ether');

            await expect(smartStayMarketplace.connect(addr1).executeSale(1, { value: price })).to.be.revertedWith(
                'SmartStay : Wrong amount sent'
            );
        });

        it('Should attempt to execute the sale of a NFT owned by the caller and expect a revert', async () => {
            const price = ethers.utils.parseUnits('1', 'ether');

            await expect(smartStayMarketplace.executeSale(1, { value: price })).to.be.revertedWith(
                'SmartStay : Can not buy your own NFT'
            );
        });
    });
});

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SmartStaySBTCollectionTest', () => {
    let smartStaySBTCollection: any;
    let owner: any;
    let addr1: any;

    const deploySmartStayFixture = async () => {
        const [_owner, _addr1] = await ethers.getSigners();
        const _SmartStaySBTCollection = await ethers.getContractFactory('SmartStaySBTCollection');
        const _smartStaySBTCollection = await _SmartStaySBTCollection.deploy();
        await _smartStaySBTCollection.deployed();

        return { _smartStaySBTCollection, _owner, _addr1 };
    };

    describe('Create', async () => {
        beforeEach(async () => {
            const { _smartStaySBTCollection, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStaySBTCollection = _smartStaySBTCollection;
            owner = _owner;
            addr1 = _addr1;
        });

        it('Should mint a SBT and check its attributes', async () => {
            const SBTMetadataURI = 'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
            const duration = 3;
            const price = ethers.utils.parseUnits('1', 'ether');
            const bookingID = 1;

            await smartStaySBTCollection.mint(addr1.address, SBTMetadataURI, duration, price, bookingID);

            const SBTList = await smartStaySBTCollection.getUserSBT(addr1.address);
            const SBT = SBTList[0];

            expect(SBT.tokenID).to.be.equal(1);
            expect(SBT.tokenURI).to.be.equal(SBTMetadataURI);
            expect(SBT.duration).to.be.equal(duration);
            expect(SBT.price).to.be.equal(price);
            expect(SBT.bookingID).to.be.equal(bookingID);
        });

        it('Should mint a SBT and check its token URI', async () => {
            const SBTMetadataURI = 'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
            const duration = 3;
            const price = ethers.utils.parseUnits('1', 'ether');
            const bookingID = 1;

            await smartStaySBTCollection.mint(addr1.address, SBTMetadataURI, duration, price, bookingID);

            const tokenURI = await smartStaySBTCollection.tokenURI(1);

            expect(tokenURI).to.be.equal(SBTMetadataURI);
        });

        it('Should attempt to mint a DID without being the owner and expect a revert', async () => {
            const SBTMetadataURI = 'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
            const duration = 3;
            const price = ethers.utils.parseUnits('1', 'ether');
            const bookingID = 1;

            await expect(
                smartStaySBTCollection.connect(addr1).mint(addr1.address, SBTMetadataURI, duration, price, bookingID)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });

    describe('Update', async () => {
        beforeEach(async () => {
            const { _smartStaySBTCollection, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStaySBTCollection = _smartStaySBTCollection;
            owner = _owner;
            addr1 = _addr1;

            const SBTMetadataURI = 'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
            const duration = 3;
            const price = ethers.utils.parseUnits('1', 'ether');
            const bookingID = 1;

            await smartStaySBTCollection.mint(addr1.address, SBTMetadataURI, duration, price, bookingID);
            await smartStaySBTCollection.mint(addr1.address, SBTMetadataURI, duration, price, bookingID);
        });

        it('Should update a SBT and check its attributes', async () => {
            const SBTMetadataURI =
                'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA?v2';
            const location = 'Paris';
            const owner = addr1.address;

            await smartStaySBTCollection.update(2, SBTMetadataURI, location, owner);

            const SBTList = await smartStaySBTCollection.getUserSBT(addr1.address);
            const SBT = SBTList[1];

            expect(SBT.tokenID).to.be.equal(2);
            expect(SBT.tokenURI).to.be.equal(SBTMetadataURI);
            expect(SBT.location).to.be.equal(location);
        });

        it('Should update a SBT and check its tokenURI', async () => {
            const SBTMetadataURI =
                'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA?v2';
            const location = 'Paris';
            const owner = addr1.address;

            await smartStaySBTCollection.update(1, SBTMetadataURI, location, owner);

            const tokenURI = await smartStaySBTCollection.tokenURI(1);

            expect(tokenURI).to.be.equal(SBTMetadataURI);
        });

        it('Should attempt to update a SBT without being the owner and expect a revert', async () => {
            const SBTMetadataURI =
                'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA?v2';
            const location = 'Paris';
            const owner = addr1.address;

            await expect(
                smartStaySBTCollection.connect(addr1).update(1, SBTMetadataURI, location, owner)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });

    describe('Burn', async () => {
        beforeEach(async () => {
            const { _smartStaySBTCollection, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStaySBTCollection = _smartStaySBTCollection;
            owner = _owner;
            addr1 = _addr1;

            const SBTMetadataURI = 'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
            const duration = 3;
            const price = ethers.utils.parseUnits('1', 'ether');
            const bookingID = 1;

            await smartStaySBTCollection.mint(addr1.address, SBTMetadataURI, duration, price, bookingID);
        });

        it('Should burn a SBT and check it is deleted', async () => {
            const SBTMetadataURI = 'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
            const duration = 3;
            const price = ethers.utils.parseUnits('1', 'ether');
            const bookingID = 1;
            await smartStaySBTCollection.mint(addr1.address, SBTMetadataURI, duration, price, bookingID);

            await smartStaySBTCollection.burn(2);

            const SBTList = await smartStaySBTCollection.getUserSBT(addr1.address);

            expect(SBTList.length).to.be.equal(1);
        });

        it('Should burn a SBT and check its cannot be accessed', async () => {
            await smartStaySBTCollection.burn(1);

            await expect(smartStaySBTCollection.tokenURI(1)).to.be.revertedWith('ERC721: invalid token ID');
        });

        it('Should attempt to burn a SBT without being the owner and expect a revert', async () => {
            await expect(smartStaySBTCollection.connect(addr1).burn(1)).to.be.revertedWith(
                'Ownable: caller is not the owner'
            );
        });
    });

    describe('Transfer', async () => {
        beforeEach(async () => {
            const { _smartStaySBTCollection, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStaySBTCollection = _smartStaySBTCollection;
            owner = _owner;
            addr1 = _addr1;

            const SBTMetadataURI = 'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
            const duration = 3;
            const price = ethers.utils.parseUnits('1', 'ether');
            const bookingID = 1;

            await smartStaySBTCollection.mint(addr1.address, SBTMetadataURI, duration, price, bookingID);
        });

        it('Should attempt to transfer a SBT and expect a revert', async () => {
            await expect(
                smartStaySBTCollection.connect(addr1).transferFrom(addr1.address, owner.address, 1)
            ).to.be.revertedWith('SmartStay : Can not transfer a SBT');
        });
    });
});

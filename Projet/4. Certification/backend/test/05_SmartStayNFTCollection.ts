import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SmartStayNFTCollectionTest', () => {
    let smartStayNFTCollection: any;
    let owner: any;
    let addr1: any;

    const deploySmartStayFixture = async () => {
        const [_owner, _addr1] = await ethers.getSigners();
        const _SmartStayNFTCollection = await ethers.getContractFactory('SmartStayNFTCollection');
        const _smartStayNFTCollection = await _SmartStayNFTCollection.deploy();
        await _smartStayNFTCollection.deployed();

        return { _smartStayNFTCollection, _owner, _addr1 };
    };

    describe('Create', async () => {
        beforeEach(async () => {
            const { _smartStayNFTCollection, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStayNFTCollection = _smartStayNFTCollection;
            owner = _owner;
            addr1 = _addr1;
        });

        it('Should mint a NFT and check its attributes', async () => {
            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI';

            await smartStayNFTCollection.mint(addr1.address, NFTMetadataURI);

            const NFTList = await smartStayNFTCollection.getUserNFT(addr1.address);
            const NFT = NFTList[0];

            expect(NFT.tokenID).to.be.equal(1);
            expect(NFT.tokenURI).to.be.equal(NFTMetadataURI);
        });

        it('Should mint a NFT and check its token URI', async () => {
            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI';

            await smartStayNFTCollection.mint(addr1.address, NFTMetadataURI);

            const tokenURI = await smartStayNFTCollection.tokenURI(1);

            expect(tokenURI).to.be.equal(NFTMetadataURI);
        });

        it('Should attempt to mint a NFT without being the owner and expect a revert', async () => {
            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI';

            await expect(smartStayNFTCollection.connect(addr1).mint(addr1.address, NFTMetadataURI)).to.be.revertedWith(
                'Ownable: caller is not the owner'
            );
        });
    });

    describe('Update', async () => {
        beforeEach(async () => {
            const { _smartStayNFTCollection, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStayNFTCollection = _smartStayNFTCollection;
            owner = _owner;
            addr1 = _addr1;

            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI';

            await smartStayNFTCollection.mint(addr1.address, NFTMetadataURI);
            await smartStayNFTCollection.mint(addr1.address, NFTMetadataURI);
        });

        it('Should update a NFT and check its attributes', async () => {
            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI?v2';

            await smartStayNFTCollection.update(2, NFTMetadataURI);

            const NFTList = await smartStayNFTCollection.getUserNFT(addr1.address);
            const NFT = NFTList[1];

            expect(NFT.tokenID).to.be.equal(2);
            expect(NFT.tokenURI).to.be.equal(NFTMetadataURI);
        });

        it('Should update a NFT and check its tokenURI', async () => {
            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI?v2';

            await smartStayNFTCollection.update(1, NFTMetadataURI);

            const tokenURI = await smartStayNFTCollection.tokenURI(1);

            expect(tokenURI).to.be.equal(NFTMetadataURI);
        });

        it('Should attempt to update a NFT without being the owner and expect a revert', async () => {
            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI?v2';

            await expect(smartStayNFTCollection.connect(addr1).update(1, NFTMetadataURI)).to.be.revertedWith(
                'Ownable: caller is not the owner'
            );
        });
    });

    describe('Burn', async () => {
        beforeEach(async () => {
            const { _smartStayNFTCollection, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStayNFTCollection = _smartStayNFTCollection;
            owner = _owner;
            addr1 = _addr1;

            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI';

            await smartStayNFTCollection.mint(addr1.address, NFTMetadataURI);
        });

        it('Should burn a NFT and check it is deleted', async () => {
            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI';
            await smartStayNFTCollection.mint(addr1.address, NFTMetadataURI);

            await smartStayNFTCollection.burn(2);

            const NFTList = await smartStayNFTCollection.getUserNFT(addr1.address);

            expect(NFTList.length).to.be.equal(1);
        });

        it('Should burn a NFT and check its cannot be accessed', async () => {
            await smartStayNFTCollection.burn(1);

            await expect(smartStayNFTCollection.tokenURI(1)).to.be.revertedWith('ERC721: invalid token ID');
        });

        it('Should attempt to burn a NFT without being the owner and expect a revert', async () => {
            await expect(smartStayNFTCollection.connect(addr1).burn(1)).to.be.revertedWith(
                'Ownable: caller is not the owner'
            );
        });
    });
});

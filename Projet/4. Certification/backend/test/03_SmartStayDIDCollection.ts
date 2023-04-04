import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';

describe('SmartStayDIDCollection contract', () => {
    let smartStayDIDCollection: any;
    let owner: any;
    let addr1: any;

    const deploySmartStayFixture = async () => {
        const [_owner, _addr1] = await ethers.getSigners();
        const _SmartStayDIDCollection = await ethers.getContractFactory('SmartStayDIDCollection');
        const _smartStayDIDCollection = await _SmartStayDIDCollection.deploy();
        await _smartStayDIDCollection.deployed();

        return { _smartStayDIDCollection, _SmartStayDIDCollection, _owner, _addr1 };
    };

    describe('NFT Collection', async () => {
        describe('Create', async () => {
            beforeEach(async () => {
                const { _smartStayDIDCollection, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                smartStayDIDCollection = _smartStayDIDCollection;
                owner = _owner;
                addr1 = _addr1;
            });

            it('Should mint a DID and check its attributes', async () => {
                const DIDMetadataURI =
                    'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
                const firstname = 'Prénom';
                const lastname = 'Nom';
                const email = 'email@email.com';
                const registeringNumber = BigNumber.from(7511606576443);

                await smartStayDIDCollection.mint(
                    addr1.address,
                    DIDMetadataURI,
                    firstname,
                    lastname,
                    email,
                    registeringNumber
                );

                const DID = await smartStayDIDCollection.getUserDID(addr1.address);

                expect(DID.tokenID).to.be.equal(1);
                expect(DID.tokenURI).to.be.equal(DIDMetadataURI);
                expect(DID.firstname).to.be.equal(firstname);
                expect(DID.lastname).to.be.equal(lastname);
                expect(DID.email).to.be.equal(email);
                expect(DID.registeringNumber).to.be.equal(registeringNumber);
            });

            it('Should mint a DID and check its token URI', async () => {
                const DIDMetadataURI =
                    'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
                const firstname = 'Prénom';
                const lastname = 'Nom';
                const email = 'email@email.com';
                const registeringNumber = BigNumber.from(7511606576443);

                await smartStayDIDCollection.mint(
                    addr1.address,
                    DIDMetadataURI,
                    firstname,
                    lastname,
                    email,
                    registeringNumber
                );

                const tokenURI = await smartStayDIDCollection.tokenURI(1);

                expect(tokenURI).to.be.equal(DIDMetadataURI);
            });

            it('Should attempt to mint a DID without being the owner and expect a revert', async () => {
                const DIDMetadataURI =
                    'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
                const firstname = 'Prénom';
                const lastname = 'Nom';
                const email = 'email@email.com';
                const registeringNumber = BigNumber.from(7511606576443);

                await expect(
                    smartStayDIDCollection
                        .connect(addr1)
                        .mint(addr1.address, DIDMetadataURI, firstname, lastname, email, registeringNumber)
                ).to.be.revertedWith('Ownable: caller is not the owner');
            });
        });

        describe('Transfer', async () => {
            beforeEach(async () => {
                const { _smartStayDIDCollection, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                smartStayDIDCollection = _smartStayDIDCollection;
                owner = _owner;
                addr1 = _addr1;
            });

            it('Should attempt to transfer a DID and expect a revert', async () => {
                const DIDMetadataURI =
                    'https://gateway.pinata.cloud/ipfs/QmTJp4g3v2HUpmd19pi59HS4WsSEsL762aWVEKx9bbhhiA';
                const firstname = 'Prénom';
                const lastname = 'Nom';
                const email = 'email@email.com';
                const registeringNumber = BigNumber.from(7511606576443);

                await smartStayDIDCollection.mint(
                    addr1.address,
                    DIDMetadataURI,
                    firstname,
                    lastname,
                    email,
                    registeringNumber
                );

                await expect(
                    smartStayDIDCollection.connect(addr1).transferFrom(addr1.address, owner.address, 1)
                ).to.be.revertedWith('SmartStay : Can not transfer or burn your DID');
            });
        });
    });
});

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';

describe('SmartStayRentingTest', () => {
    let smartStayRenting: any;
    let owner: any;
    let addr1: any;

    const deploySmartStayFixture = async () => {
        const _SmartStayRenting = await ethers.getContractFactory('SmartStayRenting');
        const [_owner, _addr1] = await ethers.getSigners();

        const _smartStayRenting = await _SmartStayRenting.deploy();

        await _smartStayRenting.deployed();

        return { _smartStayRenting, _owner, _addr1 };
    };

    describe('Create', async () => {
        beforeEach(async () => {
            const { _smartStayRenting, _owner } = await loadFixture(deploySmartStayFixture);
            smartStayRenting = _smartStayRenting;
            owner = _owner;
        });

        it('Should create a renting and check it', async () => {
            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await smartStayRenting.createRenting(_renting);

            const renting = await smartStayRenting.getRenting(1);
            expect(renting.id).to.equal(1);
            expect(renting.owner).to.equal(owner.address);
            expect(renting.unitPrice).to.equal(_renting.unitPrice);
            expect(renting.deposit).to.equal(_renting.deposit);
            expect(renting.personCount).to.equal(_renting.personCount);
            expect(renting.location).to.equal(_renting.location);
            expect(renting.tags).to.have.same.members(_renting.tags);
            expect(renting.description).to.equal(_renting.description);
            expect(renting.imageURL).to.equal(_renting.imageURL);
        });

        it('Should create a renting and check it in userRentings', async () => {
            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await smartStayRenting.createRenting(_renting);
            const rentings = await smartStayRenting.getUserRenting();
            expect(rentings[0].id).to.equal(1);
            expect(rentings[0].owner).to.equal(owner.address);
            expect(rentings[0].unitPrice).to.equal(_renting.unitPrice);
            expect(rentings[0].deposit).to.equal(_renting.deposit);
            expect(rentings[0].personCount).to.equal(_renting.personCount);
            expect(rentings[0].location).to.equal(_renting.location);
            expect(rentings[0].tags).to.have.same.members(_renting.tags);
            expect(rentings[0].description).to.equal(_renting.description);
            expect(rentings[0].imageURL).to.equal(_renting.imageURL);
        });

        it('Should create a renting and emit an event', async () => {
            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await expect(smartStayRenting.createRenting(_renting))
                .to.emit(smartStayRenting, 'RentingCreated')
                .withArgs(anyValue);
        });

        it('Should attempt to create more than 5 rentings and expect a revert', async () => {
            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            for (let i = 0; i < 5; i++) {
                await smartStayRenting.createRenting(_renting);
            }
            await expect(smartStayRenting.createRenting(_renting)).to.be.revertedWith('SmartStay : Too many renting');
        });
    });

    describe('Update', async () => {
        beforeEach(async () => {
            const { _smartStayRenting, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStayRenting = _smartStayRenting;
            owner = _owner;
            addr1 = _addr1;

            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await smartStayRenting.createRenting(_renting);
            await smartStayRenting.createRenting(_renting);
        });

        it('Should update a renting and check it', async () => {
            const _renting = {
                id: 2,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('1', 'ether'),
                deposit: ethers.utils.parseUnits('2', 'ether'),
                personCount: BigNumber.from(3),
                location: 'Lyon',
                tags: ['Maison'],
                description: 'Une très jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await smartStayRenting.updateRenting(_renting.id, _renting);
            const renting = await smartStayRenting.getRenting(_renting.id);
            expect(renting.id).to.equal(_renting.id);
            expect(renting.owner).to.equal(owner.address);
            expect(renting.unitPrice).to.equal(_renting.unitPrice);
            expect(renting.deposit).to.equal(_renting.deposit);
            expect(renting.personCount).to.equal(_renting.personCount);
            expect(renting.location).to.equal(_renting.location);
            expect(renting.tags).to.have.same.members(_renting.tags);
            expect(renting.description).to.equal(_renting.description);
            expect(renting.imageURL).to.equal(_renting.imageURL);
        });

        it('Should update a renting and check it in userRentings', async () => {
            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('1', 'ether'),
                deposit: ethers.utils.parseUnits('2', 'ether'),
                personCount: BigNumber.from(3),
                location: 'Lyon',
                tags: ['Maison'],
                description: 'Une très jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await smartStayRenting.updateRenting(_renting.id, _renting);
            const rentings = await smartStayRenting.getUserRenting();
            expect(rentings[0].id).to.equal(_renting.id);
            expect(rentings[0].owner).to.equal(owner.address);
            expect(rentings[0].unitPrice).to.equal(_renting.unitPrice);
            expect(rentings[0].deposit).to.equal(_renting.deposit);
            expect(rentings[0].personCount).to.equal(_renting.personCount);
            expect(rentings[0].location).to.equal(_renting.location);
            expect(rentings[0].tags).to.have.same.members(_renting.tags);
            expect(rentings[0].description).to.equal(_renting.description);
            expect(rentings[0].imageURL).to.equal(_renting.imageURL);
        });

        it('Should update a renting and emit an event', async () => {
            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await expect(smartStayRenting.updateRenting(_renting.id, _renting))
                .to.emit(smartStayRenting, 'RentingUpdated')
                .withArgs(anyValue);
        });

        it('Should attempt to update a renting without being owner and expect a revert', async () => {
            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await expect(smartStayRenting.connect(addr1).updateRenting(_renting.id, _renting)).to.be.revertedWith(
                'SmartStay: Not owner of the renting'
            );
        });
    });

    describe('Delete', async () => {
        beforeEach(async () => {
            const { _smartStayRenting, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStayRenting = _smartStayRenting;
            owner = _owner;
            addr1 = _addr1;

            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await smartStayRenting.createRenting(_renting);
        });

        it('Should delete a renting and check rentings', async () => {
            const _rentingID = 1;
            await smartStayRenting.deleteRenting(_rentingID);

            const renting = await smartStayRenting.getRenting(_rentingID);
            expect(renting.id).to.equal(0);
            expect(renting.owner).to.equal('0x0000000000000000000000000000000000000000');
            expect(renting.unitPrice).to.equal(0);
            expect(renting.deposit).to.equal(0);
            expect(renting.personCount).to.equal(0);
            expect(renting.location).to.be.empty;
            expect(renting.tags).to.be.empty;
            expect(renting.description).to.be.empty;
            expect(renting.imageURL).to.be.empty;
        });

        it('Should delete a renting and check userRentings', async () => {
            const _rentingID = 1;
            await smartStayRenting.deleteRenting(_rentingID);
            const renting = await smartStayRenting.getUserRenting();
            expect(renting).to.be.empty;
        });

        it('Should delete a renting and emit an event', async () => {
            const _rentingID = 1;
            await expect(smartStayRenting.deleteRenting(_rentingID))
                .to.emit(smartStayRenting, 'RentingDeleted')
                .withArgs(_rentingID);
        });

        it('Should attempt to delete a renting without being owner and expect a revert', async () => {
            const _rentingID = 1;
            await expect(smartStayRenting.connect(addr1).deleteRenting(_rentingID)).to.be.revertedWith(
                'SmartStay: Not owner of the renting'
            );
        });
    });

    describe('Search', async () => {
        beforeEach(async () => {
            const { _smartStayRenting, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
            smartStayRenting = _smartStayRenting;
            owner = _owner;
            addr1 = _addr1;

            let _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };
            await smartStayRenting.createRenting(_renting);

            _renting.unitPrice = ethers.utils.parseUnits('1', 'ether');

            await smartStayRenting.createRenting(_renting);

            _renting.personCount = BigNumber.from(5);

            await smartStayRenting.createRenting(_renting);

            _renting.location = 'Lyon';

            await smartStayRenting.createRenting(_renting);

            _renting.tags = ['Appartement'];

            await smartStayRenting.createRenting(_renting);
        });

        it('Should search with default params and check the length', async () => {
            const rentings = await smartStayRenting.searchRenting(0, 0, '', []);
            expect(rentings.length).to.be.equal(5);
        });

        it('Should search with unitPrice and check the length', async () => {
            const rentings = await smartStayRenting.searchRenting(ethers.utils.parseUnits('0.5', 'ether'), 0, '', []);
            expect(rentings.length).to.be.equal(1);
        });

        it('Should search with personCount and check the length', async () => {
            const rentings = await smartStayRenting.searchRenting(0, 4, '', []);
            expect(rentings.length).to.be.equal(3);
        });

        it('Should search with location and check the length', async () => {
            const rentings = await smartStayRenting.searchRenting(0, 0, 'Paris', []);
            expect(rentings.length).to.be.equal(3);
        });

        it('Should search with location and check the length', async () => {
            const rentings = await smartStayRenting.searchRenting(0, 0, '', ['Maison']);
            expect(rentings.length).to.be.equal(4);
        });
    });
});

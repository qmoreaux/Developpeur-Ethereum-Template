import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';

describe('SmartStay contract test', () => {
    let smartStay: any;
    let owner: any;
    let addr1: any;

    const deploySmartStayFixture = async () => {
        const _SmartStay = await ethers.getContractFactory('SmartStay');
        const [_owner, _addr1] = await ethers.getSigners();

        const _smartStay = await _SmartStay.deploy();

        await _smartStay.deployed();

        // Fixtures can return anything you consider useful for your tests
        return { _SmartStay, _smartStay, _owner, _addr1 };
    };

    describe('Renting', async () => {
        describe('Create', async () => {
            beforeEach(async () => {
                const { _smartStay, _owner } = await loadFixture(deploySmartStayFixture);
                smartStay = _smartStay;
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await smartStay.createRenting(_renting);

                const renting = await smartStay.getRenting(1);
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await smartStay.createRenting(_renting);
                const rentings = await smartStay.getUserRenting();
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await expect(smartStay.createRenting(_renting)).to.emit(smartStay, 'RentingCreated').withArgs(anyValue);
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                for (let i = 0; i < 5; i++) {
                    await smartStay.createRenting(_renting);
                }
                await expect(smartStay.createRenting(_renting)).to.be.revertedWith('SmartStay : Too many renting');
            });
        });

        describe('Update', async () => {
            beforeEach(async () => {
                const { _smartStay, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                smartStay = _smartStay;
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await smartStay.createRenting(_renting);
                await smartStay.createRenting(_renting);
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await smartStay.updateRenting(_renting.id, _renting);
                const renting = await smartStay.getRenting(_renting.id);
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await smartStay.updateRenting(_renting.id, _renting);
                const rentings = await smartStay.getUserRenting();
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await expect(smartStay.updateRenting(_renting.id, _renting))
                    .to.emit(smartStay, 'RentingUpdated')
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await expect(smartStay.connect(addr1).updateRenting(_renting.id, _renting)).to.be.revertedWith(
                    'SmartStay: Not owner of the renting'
                );
            });
        });

        describe('Delete', async () => {
            beforeEach(async () => {
                const { _smartStay, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                smartStay = _smartStay;
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await smartStay.createRenting(_renting);
            });

            it('Should delete a renting and check rentings', async () => {
                const _rentingID = 1;
                await smartStay.deleteRenting(_rentingID);

                const renting = await smartStay.getRenting(_rentingID);
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
                await smartStay.deleteRenting(_rentingID);
                const renting = await smartStay.getUserRenting();
                expect(renting).to.be.empty;
            });

            it('Should delete a renting and emit an event', async () => {
                const _rentingID = 1;
                await expect(smartStay.deleteRenting(_rentingID))
                    .to.emit(smartStay, 'RentingDeleted')
                    .withArgs(_rentingID);
            });

            it('Should attempt to delete a renting without being owner and expect a revert', async () => {
                const _rentingID = 1;
                await expect(smartStay.connect(addr1).deleteRenting(_rentingID)).to.be.revertedWith(
                    'SmartStay: Not owner of the renting'
                );
            });
        });

        describe('Search', async () => {
            beforeEach(async () => {
                const { _smartStay, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                smartStay = _smartStay;
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };
                await smartStay.createRenting(_renting);

                _renting.unitPrice = ethers.utils.parseUnits('1', 'ether');

                await smartStay.createRenting(_renting);

                _renting.personCount = BigNumber.from(5);

                await smartStay.createRenting(_renting);

                _renting.location = 'Lyon';

                await smartStay.createRenting(_renting);

                _renting.tags = ['Appartement'];

                await smartStay.createRenting(_renting);
            });

            it('Should search with default params and check the length', async () => {
                const rentings = await smartStay.searchRenting(0, 0, '', []);
                expect(rentings.length).to.be.equal(5);
            });

            it('Should search with unitPrice and check the length', async () => {
                const rentings = await smartStay.searchRenting(ethers.utils.parseUnits('0.5', 'ether'), 0, '', []);
                expect(rentings.length).to.be.equal(1);
            });

            it('Should search with personCount and check the length', async () => {
                const rentings = await smartStay.searchRenting(0, 4, '', []);
                expect(rentings.length).to.be.equal(3);
            });

            it('Should search with location and check the length', async () => {
                const rentings = await smartStay.searchRenting(0, 0, 'Paris', []);
                expect(rentings.length).to.be.equal(3);
            });

            it('Should search with location and check the length', async () => {
                const rentings = await smartStay.searchRenting(0, 0, '', ['Maison']);
                expect(rentings.length).to.be.equal(4);
            });
        });
    });

    describe('Booking', async () => {
        describe('Create', async () => {
            beforeEach(async () => {
                const { _smartStay, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                smartStay = _smartStay;
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
                    imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                };

                await smartStay.createRenting(_renting);
            });

            it('Should create a booking and check it for owner', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;
                await smartStay.connect(addr1).createBooking(1, date, duration, 1);

                const bookings = await smartStay.getBookingOwner();

                expect(bookings[0].id).to.be.equal(1);
                expect(bookings[0].rentingID).to.be.equal(1);
                expect(bookings[0].timestampStart).to.be.equal(date);
                expect(bookings[0].duration).to.be.equal(duration);
                expect(bookings[0].timestampEnd).to.be.equal(date + duration * 60 * 60 * 24 - 1);
                expect(bookings[0].personCount).to.be.equal(1);
            });

            it('Should create a booking and check it for recipient', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;
                await smartStay.connect(addr1).createBooking(1, date, duration, 1);

                const bookings = await smartStay.connect(addr1).getBookingRecipient();

                expect(bookings[0].id).to.be.equal(1);
                expect(bookings[0].rentingID).to.be.equal(1);
                expect(bookings[0].timestampStart).to.be.equal(date);
                expect(bookings[0].duration).to.be.equal(duration);
                expect(bookings[0].timestampEnd).to.be.equal(date + duration * 60 * 60 * 24 - 1);
                expect(bookings[0].personCount).to.be.equal(1);
            });

            it('Should create a booking and emit an event', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await expect(smartStay.connect(addr1).createBooking(1, date, duration, 1))
                    .to.emit(smartStay, 'BookingCreated')
                    .withArgs(anyValue);
            });

            it('Should attempt to create a booking for its own renting and expect a revert', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await expect(smartStay.createBooking(1, date, duration, 1)).to.be.revertedWith(
                    'SmartStay : Can not create booking for your own rentings'
                );
            });

            it('Should attempt to create a booking in the past and expect a revert', async () => {
                const date = Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24;
                const duration = 3;

                await expect(smartStay.connect(addr1).createBooking(1, date, duration, 1)).to.be.revertedWith(
                    'SmartStay : Can not create a booking in the past'
                );
            });

            it('Should attempt to create a booking for a number of person too important and expect a revert', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await expect(smartStay.connect(addr1).createBooking(1, date, duration, 10)).to.be.revertedWith(
                    'SmartStay : Too many persons for this renting'
                );
            });
        });

        describe('Get Renting', async () => {
            const _renting = {
                id: 1,
                owner: '0x0000000000000000000000000000000000000000',
                unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
                deposit: ethers.utils.parseUnits('1', 'ether'),
                personCount: BigNumber.from(1),
                location: 'Paris',
                tags: ['Maison', 'Bord de mer'],
                description: 'Une jolie maison',
                imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
            };

            beforeEach(async () => {
                const { _smartStay, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                smartStay = _smartStay;
                owner = _owner;
                addr1 = _addr1;

                await smartStay.createRenting(_renting);

                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await smartStay.connect(addr1).createBooking(1, date, duration, 1);
            });

            it('Should get the renting for a booking', async () => {
                const renting = await smartStay.getRentingFromBookingID(1);
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
        });

        describe('Status', async () => {
            describe('Approve', async () => {
                beforeEach(async () => {
                    const { _smartStay, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                    smartStay = _smartStay;
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
                        imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                    };

                    await smartStay.createRenting(_renting);

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStay.connect(addr1).createBooking(1, date, duration, 1);
                    await smartStay.connect(addr1).createBooking(1, date, duration, 1);
                });

                it('Should approve a booking and check its status', async () => {
                    await smartStay.approveBooking(1);

                    const booking = await smartStay.getBooking(1);

                    expect(booking.status).to.be.equal(1);
                });

                it('Should approve a booking and emit an event', async () => {
                    await expect(smartStay.approveBooking(2)).to.emit(smartStay, 'BookingUpdated').withArgs(anyValue);
                });

                it('Should attempt to approve a booking as recipient and expect a revert', async () => {
                    await expect(smartStay.connect(addr1).approveBooking(1)).to.be.revertedWith(
                        'SmartStay: Not owner of the booking'
                    );
                });

                it('Should attempt to approve a booking already approved and expect a revert', async () => {
                    await smartStay.approveBooking(1);
                    await expect(smartStay.approveBooking(1)).to.be.revertedWith('SmartStay : Wrong booking status');
                });
            });

            describe('Reject', async () => {
                beforeEach(async () => {
                    const { _smartStay, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                    smartStay = _smartStay;
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
                        imageURL: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs'
                    };

                    await smartStay.createRenting(_renting);

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStay.connect(addr1).createBooking(1, date, duration, 1);
                });

                it('Should reject a booking and check its status', async () => {
                    await smartStay.rejectBooking(1);

                    const booking = await smartStay.getBooking(1);

                    expect(booking.status).to.be.equal(5);
                });

                it('Should reject a booking and emit an event', async () => {
                    await expect(smartStay.rejectBooking(1)).to.emit(smartStay, 'BookingUpdated').withArgs(anyValue);
                });

                it('Should attempt to reject a booking as recipient and expect a revert', async () => {
                    await expect(smartStay.connect(addr1).rejectBooking(1)).to.be.revertedWith(
                        'SmartStay: Not owner of the booking'
                    );
                });

                it('Should attempt to reject a booking already rejected and expect a revert', async () => {
                    await smartStay.rejectBooking(1);
                    await expect(smartStay.rejectBooking(1)).to.be.revertedWith('SmartStay : Wrong booking status');
                });
            });
        });
    });

    describe('Utils', async () => {
        beforeEach(async () => {
            const { _smartStay, _owner } = await loadFixture(deploySmartStayFixture);
            smartStay = _smartStay;
            owner = _owner;
        });

        it('Should get tags', async () => {
            const _tags = ['Maison', 'Appartement', 'Piscine', 'Montagne', 'Bord de mer'];

            const tags = await smartStay.getTags();
            expect(tags).to.have.same.members(_tags);
        });
    });
});

import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';

describe('SmartStayBookingTest', () => {
    let smartStayBooking: any;
    let smartStayRenting: any;
    let owner: any;
    let addr1: any;

    const deploySmartStayFixture = async () => {
        const [_owner, _addr1] = await ethers.getSigners();
        const _SmartStayRenting = await ethers.getContractFactory('SmartStayRenting');
        const _smartStayRenting = await _SmartStayRenting.deploy(false);
        const instance = await _smartStayRenting.deployed();

        const _SmartStayBooking = await ethers.getContractFactory('SmartStayBooking');
        const _smartStayBooking = await _SmartStayBooking.deploy(instance.address, false);

        return { _smartStayRenting, _smartStayBooking, _owner, _addr1 };
    };

    describe('Booking', async () => {
        describe('Create', async () => {
            beforeEach(async () => {
                const { _smartStayBooking, _smartStayRenting, _owner, _addr1 } = await loadFixture(
                    deploySmartStayFixture
                );
                smartStayBooking = _smartStayBooking;
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

            it('Should create a booking and check it for owner', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;
                await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                const bookings = await smartStayBooking.getBookingOwner();

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
                await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                const bookings = await smartStayBooking.connect(addr1).getBookingRecipient();

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

                await expect(smartStayBooking.connect(addr1).createBooking(1, date, duration, 1))
                    .to.emit(smartStayBooking, 'BookingCreated')
                    .withArgs(anyValue);
            });

            it('Should attempt to create a booking for its own renting and expect a revert', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await expect(smartStayBooking.createBooking(1, date, duration, 1)).to.be.revertedWith(
                    'SmartStay : Can not create booking for your own rentings'
                );
            });

            it('Should attempt to create a booking in the past and expect a revert', async () => {
                const date = Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24;
                const duration = 3;

                await expect(smartStayBooking.connect(addr1).createBooking(1, date, duration, 1)).to.be.revertedWith(
                    'SmartStay : Can not create a booking in the past'
                );
            });

            it('Should attempt to create a booking for a number of person too important and expect a revert', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await expect(smartStayBooking.connect(addr1).createBooking(1, date, duration, 10)).to.be.revertedWith(
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
                imageURL: 'https://ipfs.io/ipfs/imageURI'
            };

            beforeEach(async () => {
                const { _smartStayBooking, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                smartStayBooking = _smartStayBooking;
                owner = _owner;
                addr1 = _addr1;

                await smartStayRenting.createRenting(_renting);

                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);
            });

            it('Should get the renting for a booking', async () => {
                const renting = await smartStayBooking.getRentingFromBookingID(1);
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
                    const { _smartStayBooking, _smartStayRenting, _owner, _addr1 } = await loadFixture(
                        deploySmartStayFixture
                    );
                    smartStayBooking = _smartStayBooking;
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

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);
                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);
                });

                it('Should approve a booking and check its status', async () => {
                    await smartStayBooking.approveBooking(1);

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.status).to.be.equal(1);
                });

                it('Should approve a booking and emit an event', async () => {
                    await expect(smartStayBooking.approveBooking(2))
                        .to.emit(smartStayBooking, 'BookingUpdated')
                        .withArgs(anyValue);
                });

                it('Should attempt to approve a booking as recipient and expect a revert', async () => {
                    await expect(smartStayBooking.connect(addr1).approveBooking(1)).to.be.revertedWith(
                        'SmartStay: Not owner of the booking'
                    );
                });

                it('Should attempt to approve a booking already approved and expect a revert', async () => {
                    await smartStayBooking.approveBooking(1);
                    await expect(smartStayBooking.approveBooking(1)).to.be.revertedWith(
                        'SmartStay : Wrong booking status'
                    );
                });
            });

            describe('Reject', async () => {
                beforeEach(async () => {
                    const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                        deploySmartStayFixture
                    );
                    smartStayRenting = _smartStayRenting;
                    smartStayBooking = _smartStayBooking;
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

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);
                });

                it('Should reject a booking and check its status', async () => {
                    await smartStayBooking.rejectBooking(1);

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.status).to.be.equal(5);
                });

                it('Should reject a booking and emit an event', async () => {
                    await expect(smartStayBooking.rejectBooking(1))
                        .to.emit(smartStayBooking, 'BookingUpdated')
                        .withArgs(anyValue);
                });

                it('Should attempt to reject a booking as recipient and expect a revert', async () => {
                    await expect(smartStayBooking.connect(addr1).rejectBooking(1)).to.be.revertedWith(
                        'SmartStay: Not owner of the booking'
                    );
                });

                it('Should attempt to reject a booking already rejected and expect a revert', async () => {
                    await smartStayBooking.rejectBooking(1);
                    await expect(smartStayBooking.rejectBooking(1)).to.be.revertedWith(
                        'SmartStay : Wrong booking status'
                    );
                });
            });

            describe('ConfirmBooking', async () => {
                const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';
                const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

                beforeEach(async () => {
                    const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                        deploySmartStayFixture
                    );
                    smartStayRenting = _smartStayRenting;
                    smartStayBooking = _smartStayBooking;
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

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);
                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                    await smartStayBooking.approveBooking(1);
                    await smartStayBooking.approveBooking(2);
                });

                it('Should confirm a booking and check its status', async () => {
                    await smartStayBooking
                        .connect(addr1)
                        .confirmBooking(2, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });

                    const booking = await smartStayBooking.getBooking(2);

                    expect(booking.status).to.be.equal(2);
                });

                it('Should confirm a booking and check its amount and deposit locked', async () => {
                    await smartStayBooking
                        .connect(addr1)
                        .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.amountLocked).to.be.equal(BigNumber.from(ethers.utils.parseUnits('0.3', 'ether')));
                    expect(booking.depositLocked).to.be.equal(BigNumber.from(ethers.utils.parseUnits('1', 'ether')));
                });

                it('Should confirm a booking and check that balances are changed', async () => {
                    await expect(
                        smartStayBooking
                            .connect(addr1)
                            .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend })
                    ).to.changeEtherBalances(
                        [addr1, smartStayBooking.address],
                        [BigNumber.from(amountToSend).mul(-1), BigNumber.from(amountToSend)]
                    );
                });

                it('Should confirm a booking and check SBT IDs', async () => {
                    await smartStayBooking
                        .connect(addr1)
                        .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.SBTOwnerID).to.be.equal(1);
                    expect(booking.SBTRecipientID).to.be.equal(2);
                });

                it('Should confirm a booking and emit an event', async () => {
                    await expect(
                        smartStayBooking
                            .connect(addr1)
                            .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend })
                    )
                        .to.emit(smartStayBooking, 'BookingUpdated')
                        .withArgs(anyValue);
                });

                it('Should attempt to confirm a booking as owner and expect a revert', async () => {
                    await expect(
                        smartStayBooking.confirmBooking(1, ownerMetadataURI, recipientMetadataURI, {
                            value: amountToSend
                        })
                    ).to.be.revertedWith('SmartStay: Not recipient of the booking');
                });

                it('Should attempt to confirm a booking already confirmed and expect a revert', async () => {
                    await smartStayBooking
                        .connect(addr1)
                        .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });
                    await expect(
                        smartStayBooking
                            .connect(addr1)
                            .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend })
                    ).to.be.revertedWith('SmartStay : Wrong booking status');
                });

                it('Should attempt to confirm a booking without sending enough ether and expect a revert', async () => {
                    await expect(
                        smartStayBooking
                            .connect(addr1)
                            .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: 0 })
                    ).to.be.revertedWith('SmartStay: Not enough sent');
                });
            });

            describe('ValidateBookingAsOwner', async () => {
                beforeEach(async () => {
                    const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                        deploySmartStayFixture
                    );
                    smartStayRenting = _smartStayRenting;
                    smartStayBooking = _smartStayBooking;
                    owner = _owner;
                    addr1 = _addr1;

                    const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                    const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';
                    const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

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

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                    await smartStayBooking.approveBooking(1);
                    await smartStayBooking
                        .connect(addr1)
                        .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });
                });

                it('Should validate a booking as owner and check validatedOwner', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await smartStayBooking.validateBookingAsOwner(1);

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.validatedOwner).to.be.true;
                });

                it('Should validate a booking as owner after recipient and check its status', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);
                    await smartStayBooking.validateBookingAsOwner(1);

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.status).to.be.equal(3);
                });

                it('Should validate a booking and emit an event', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await expect(smartStayBooking.validateBookingAsOwner(1))
                        .to.emit(smartStayBooking, 'BookingUpdated')
                        .withArgs(anyValue);
                });

                it('Should attempt to validate a booking for owner as recipient and expect a revert', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await expect(smartStayBooking.connect(addr1).validateBookingAsOwner(1)).to.be.revertedWith(
                        'SmartStay: Not owner of the booking'
                    );
                });

                it('Should attempt to validate a booking twice and expect a revert', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    smartStayBooking.validateBookingAsOwner(1);
                    await expect(smartStayBooking.validateBookingAsOwner(1)).to.be.revertedWith(
                        'SmartStay : Booking already validated by owner'
                    );
                });

                it('Should attempt to validate a booking already validated and expect a revert', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);
                    await smartStayBooking.validateBookingAsOwner(1);
                    await expect(smartStayBooking.validateBookingAsOwner(1)).to.be.revertedWith(
                        'SmartStay : Wrong booking status'
                    );
                });

                it('Should attempt to validate a booking before its end and expect a revert', async () => {
                    await expect(smartStayBooking.validateBookingAsOwner(1)).to.be.revertedWith(
                        'SmartStay : Booking is not finished yet'
                    );
                });
            });

            describe('ValidateBookingAsRecipient', async () => {
                beforeEach(async () => {
                    const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                        deploySmartStayFixture
                    );
                    smartStayRenting = _smartStayRenting;
                    smartStayBooking = _smartStayBooking;
                    owner = _owner;
                    addr1 = _addr1;

                    const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                    const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';
                    const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

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

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                    await smartStayBooking.approveBooking(1);
                    await smartStayBooking
                        .connect(addr1)
                        .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });
                });

                it('Should validate a booking as owner and check validateRecipient', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.validatedRecipient).to.be.true;
                });

                it('Should validate a booking as recipient after owner and check its status', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await smartStayBooking.validateBookingAsOwner(1);
                    await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.status).to.be.equal(3);
                });

                it('Should validate a booking and emit an event', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await expect(smartStayBooking.connect(addr1).validateBookingAsRecipient(1))
                        .to.emit(smartStayBooking, 'BookingUpdated')
                        .withArgs(anyValue);
                });

                it('Should attempt to validate a booking for recipient as owner and expect a revert', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await expect(smartStayBooking.validateBookingAsRecipient(1)).to.be.revertedWith(
                        'SmartStay: Not recipient of the booking'
                    );
                });

                it('Should attempt to validate a booking twice and expect a revert', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    smartStayBooking.connect(addr1).validateBookingAsRecipient(1);
                    await expect(smartStayBooking.connect(addr1).validateBookingAsRecipient(1)).to.be.revertedWith(
                        'SmartStay : Booking already validated by recipient'
                    );
                });

                it('Should attempt to validate a booking already validated and expect a revert', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await smartStayBooking.validateBookingAsOwner(1);
                    await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);
                    await expect(smartStayBooking.connect(addr1).validateBookingAsRecipient(1)).to.be.revertedWith(
                        'SmartStay : Wrong booking status'
                    );
                });

                it('Should attempt to validate a booking before its end and expect a revert', async () => {
                    await expect(smartStayBooking.connect(addr1).validateBookingAsRecipient(1)).to.be.revertedWith(
                        'SmartStay : Booking is not finished yet'
                    );
                });
            });

            describe('RetrieveDeposit', async () => {
                beforeEach(async () => {
                    const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                        deploySmartStayFixture
                    );
                    smartStayRenting = _smartStayRenting;
                    smartStayBooking = _smartStayBooking;
                    owner = _owner;
                    addr1 = _addr1;

                    const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                    const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';
                    const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

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

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                    await smartStayBooking.approveBooking(1);
                    await smartStayBooking
                        .connect(addr1)
                        .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });

                    await time.increase(60 * 60 * 24 * 4);

                    await smartStayBooking.validateBookingAsOwner(1);
                    await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);
                });

                it('Should retrieve deposit and check depositLocked value', async () => {
                    await smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI');

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.depositLocked).to.be.equal(0);
                });

                it('Should retrieve deposit and check balances has been updated', async () => {
                    const amountToRetrieve = ethers.utils.parseUnits('1', 'ether');
                    await expect(
                        smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI')
                    ).to.changeEtherBalances(
                        [smartStayBooking.address, addr1],
                        [amountToRetrieve.mul(-1), amountToRetrieve]
                    );
                });

                it('Should retrieve deposit after owner retrieved amount and check its status', async () => {
                    await smartStayBooking.retrieveAmount(1, 'https://newTokenURI');
                    await smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI');

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.status).to.be.equal(4);
                });

                it('Should retrieve deposit and emit an event', async () => {
                    await expect(smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI'))
                        .to.emit(smartStayBooking, 'BookingUpdated')
                        .withArgs(anyValue);
                });

                it('Should attempt to retrieve deposit as owner and expect a revert', async () => {
                    await expect(smartStayBooking.retrieveDeposit(1, 'https://newTokenURI')).to.be.revertedWith(
                        'SmartStay: Not recipient of the booking'
                    );
                });

                it('Should attempt to retrieve deposit twice and expect a revert', async () => {
                    await smartStayBooking.retrieveAmount(1, 'https://newTokenURI');
                    await smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI');

                    await expect(
                        smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI')
                    ).to.be.revertedWith('SmartStay : Wrong booking status');
                });
            });

            describe('RetrieveAmount', async () => {
                beforeEach(async () => {
                    const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                        deploySmartStayFixture
                    );
                    smartStayRenting = _smartStayRenting;
                    smartStayBooking = _smartStayBooking;
                    owner = _owner;
                    addr1 = _addr1;

                    const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                    const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';
                    const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

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

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                    await smartStayBooking.approveBooking(1);
                    await smartStayBooking
                        .connect(addr1)
                        .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });

                    await time.increase(60 * 60 * 24 * 4);

                    await smartStayBooking.validateBookingAsOwner(1);
                    await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);
                });

                it('Should retrieve amount and check amountLocked value', async () => {
                    await smartStayBooking.retrieveAmount(1, 'https://newTokenURI');

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.amountLocked).to.be.equal(0);
                });

                it('Should retrieve amount and check balances has been updated', async () => {
                    const amountToRetrieve = ethers.utils.parseUnits('0.3', 'ether');
                    await expect(smartStayBooking.retrieveAmount(1, 'https://newTokenURI')).to.changeEtherBalances(
                        [smartStayBooking.address, owner],
                        [amountToRetrieve.mul(-1), amountToRetrieve]
                    );
                });

                it('Should retrieve amount after recipient retrieved deposit and check its status', async () => {
                    await smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI');
                    await smartStayBooking.retrieveAmount(1, 'https://newTokenURI');

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.status).to.be.equal(4);
                });

                it('Should retrieve amount and emit an event', async () => {
                    await expect(smartStayBooking.retrieveAmount(1, 'https://newTokenURI'))
                        .to.emit(smartStayBooking, 'BookingUpdated')
                        .withArgs(anyValue);
                });

                it('Should attempt to retrieve amount as recipient and expect a revert', async () => {
                    await expect(
                        smartStayBooking.connect(addr1).retrieveAmount(1, 'https://newTokenURI')
                    ).to.be.revertedWith('SmartStay: Not owner of the booking');
                });

                it('Should attempt to retrieve amount twice and expect a revert', async () => {
                    await smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI');
                    await smartStayBooking.retrieveAmount(1, 'https://newTokenURI');

                    await expect(smartStayBooking.retrieveAmount(1, 'https://newTokenURI')).to.be.revertedWith(
                        'SmartStay : Wrong booking status'
                    );
                });
            });

            describe('CancelBooking', async () => {
                beforeEach(async () => {
                    const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                        deploySmartStayFixture
                    );
                    smartStayRenting = _smartStayRenting;
                    smartStayBooking = _smartStayBooking;
                    owner = _owner;
                    addr1 = _addr1;

                    const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                    const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';
                    const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

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

                    const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                    const duration = 3;

                    await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                    await smartStayBooking.approveBooking(1);
                    await smartStayBooking
                        .connect(addr1)
                        .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });
                });

                it('Should cancel booking and check amount and deposit locked', async () => {
                    await smartStayBooking.connect(addr1).cancelBooking(1);

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.amountLocked).to.be.equal(0);
                    expect(booking.depositLocked).to.be.equal(0);
                });

                it('Should cancel booking and check balances has been updated', async () => {
                    const amountToRetrieve = ethers.utils.parseUnits('1.3', 'ether');

                    await expect(smartStayBooking.connect(addr1).cancelBooking(1)).to.changeEtherBalances(
                        [smartStayBooking.address, addr1],
                        [BigNumber.from(amountToRetrieve).mul(-1), BigNumber.from(amountToRetrieve)]
                    );
                });

                it('Should cancel booking and check NFT and SBT has been burned', async () => {
                    const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI';
                    await smartStayBooking.connect(addr1).redeemNFT(1, NFTMetadataURI);

                    await smartStayBooking.connect(addr1).cancelBooking(1);

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.NFTRecipientID).to.be.equal(0);
                    expect(booking.SBTRecipientID).to.be.equal(0);
                    expect(booking.SBTOwnerID).to.be.equal(0);
                });

                it('Should cancel booking and check status has been updated', async () => {
                    await smartStayBooking.connect(addr1).cancelBooking(1);

                    const booking = await smartStayBooking.getBooking(1);

                    expect(booking.status).to.be.equal(6);
                });

                it('Should cancel booking and emit an event', async () => {
                    await expect(smartStayBooking.connect(addr1).cancelBooking(1))
                        .to.emit(smartStayBooking, 'BookingUpdated')
                        .withArgs(anyValue);
                });

                it('Should attempt to cancel a booking a owner and expect a revert', async () => {
                    await expect(smartStayBooking.cancelBooking(1)).to.be.revertedWith(
                        'SmartStay: Not recipient of the booking'
                    );
                });

                it('Should attempt to cancel a booking already started and expect a revert', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await expect(smartStayBooking.connect(addr1).cancelBooking(1)).to.be.revertedWith(
                        'SmartStay : Can not cancel booking already started'
                    );
                });

                it('Should attempt to cancel a booking already validated and expect a revert', async () => {
                    await time.increase(60 * 60 * 24 * 4);

                    await smartStayBooking.validateBookingAsOwner(1);
                    await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);

                    await expect(smartStayBooking.connect(addr1).cancelBooking(1)).to.be.revertedWith(
                        'SmartStay : Wrong booking status'
                    );
                });
            });
        });
    });

    describe('Rating', async () => {
        describe('Owner', async () => {
            beforeEach(async () => {
                const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                    deploySmartStayFixture
                );
                smartStayRenting = _smartStayRenting;
                smartStayBooking = _smartStayBooking;
                owner = _owner;
                addr1 = _addr1;

                const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';
                const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

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

                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                await smartStayBooking.approveBooking(1);
                await smartStayBooking
                    .connect(addr1)
                    .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });

                await time.increase(60 * 60 * 24 * 4);

                await smartStayBooking.validateBookingAsOwner(1);
                await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);

                await smartStayBooking.retrieveAmount(1, 'https://newTokenURI');
                await smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI');
            });

            it('Should rate the owner and check a rating has been created', async () => {
                const note = 5;
                const comment = 'A comment';
                await smartStayBooking.connect(addr1).rateOwner(1, note, comment);

                const ratings = await smartStayBooking.getRating(owner.address);
                const rating = ratings[0];

                expect(rating.id).to.be.equal(1);
                expect(rating.from).to.be.equal(addr1.address);
                expect(rating.note).to.be.equal(note);
                expect(rating.comment).to.be.equal(comment);
                expect(rating.owner).to.be.true;
            });

            it('Should rate the owner and check the booking has been updated', async () => {
                const note = 5;
                const comment = 'A comment';
                await smartStayBooking.connect(addr1).rateOwner(1, note, comment);

                const booking = await smartStayBooking.getBooking(1);

                expect(booking.ratedOwner).to.be.true;
            });

            it('Should rate the owner and expect a RatingCreated event', async () => {
                const note = 5;
                const comment = 'A comment';

                await expect(smartStayBooking.connect(addr1).rateOwner(1, note, comment))
                    .to.emit(smartStayBooking, 'RatingCreated')
                    .withArgs(anyValue);
            });

            it('Should rate the owner and expect a BookingUpdated event', async () => {
                const note = 5;
                const comment = 'A comment';

                await expect(smartStayBooking.connect(addr1).rateOwner(1, note, comment))
                    .to.emit(smartStayBooking, 'BookingUpdated')
                    .withArgs(anyValue);
            });

            it('Should attempt to rate the owner without being the recipient and expect a revert', async () => {
                const note = 5;
                const comment = 'A comment';

                await expect(smartStayBooking.rateOwner(1, note, comment)).to.be.revertedWith(
                    'SmartStay: Not recipient of the booking'
                );
            });

            it('Should attempt to rate the owner without the booking being completed and expect a revert', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 5;
                const duration = 3;

                await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                const note = 5;
                const comment = 'A comment';

                await expect(smartStayBooking.connect(addr1).rateOwner(2, note, comment)).to.be.revertedWith(
                    'SmartStay : Wrong booking status'
                );
            });

            it('Should attempt to rate the owner twice and expect a revert', async () => {
                const note = 5;
                const comment = 'A comment';

                await smartStayBooking.connect(addr1).rateOwner(1, note, comment);

                await expect(smartStayBooking.connect(addr1).rateOwner(1, note, comment)).to.be.revertedWith(
                    'SmartStay: Already rated owner for this booking'
                );
            });
        });

        describe('Recipient', async () => {
            beforeEach(async () => {
                const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                    deploySmartStayFixture
                );
                smartStayRenting = _smartStayRenting;
                smartStayBooking = _smartStayBooking;
                owner = _owner;
                addr1 = _addr1;

                const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';
                const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

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

                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                await smartStayBooking.approveBooking(1);
                await smartStayBooking
                    .connect(addr1)
                    .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });

                await time.increase(60 * 60 * 24 * 4);

                await smartStayBooking.validateBookingAsOwner(1);
                await smartStayBooking.connect(addr1).validateBookingAsRecipient(1);

                await smartStayBooking.retrieveAmount(1, 'https://newTokenURI');
                await smartStayBooking.connect(addr1).retrieveDeposit(1, 'https://newTokenURI');
            });

            it('Should rate the recipient and check a rating has been created', async () => {
                const note = 5;
                const comment = 'A comment';
                await smartStayBooking.rateRecipient(1, note, comment);

                const ratings = await smartStayBooking.getRating(addr1.address);
                const rating = ratings[0];

                expect(rating.id).to.be.equal(1);
                expect(rating.from).to.be.equal(owner.address);
                expect(rating.note).to.be.equal(note);
                expect(rating.comment).to.be.equal(comment);
                expect(rating.owner).to.be.false;
            });

            it('Should rate the recipient and check the booking has been updated', async () => {
                const note = 5;
                const comment = 'A comment';
                await smartStayBooking.rateRecipient(1, note, comment);

                const booking = await smartStayBooking.getBooking(1);

                expect(booking.ratedRecipient).to.be.true;
            });

            it('Should rate the recipient and expect a RatingCreated event', async () => {
                const note = 5;
                const comment = 'A comment';

                await expect(smartStayBooking.rateRecipient(1, note, comment))
                    .to.emit(smartStayBooking, 'RatingCreated')
                    .withArgs(anyValue);
            });

            it('Should rate the recipient and expect a BookingUpdated event', async () => {
                const note = 5;
                const comment = 'A comment';

                await expect(smartStayBooking.rateRecipient(1, note, comment))
                    .to.emit(smartStayBooking, 'BookingUpdated')
                    .withArgs(anyValue);
            });

            it('Should attempt to rate the recipient without being the owner and expect a revert', async () => {
                const note = 5;
                const comment = 'A comment';

                await expect(smartStayBooking.connect(addr1).rateRecipient(1, note, comment)).to.be.revertedWith(
                    'SmartStay: Not owner of the booking'
                );
            });

            it('Should attempt to rate the recipient without the booking being completed and expect a revert', async () => {
                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 5;
                const duration = 3;

                await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                const note = 5;
                const comment = 'A comment';

                await expect(smartStayBooking.rateRecipient(2, note, comment)).to.be.revertedWith(
                    'SmartStay : Wrong booking status'
                );
            });

            it('Should attempt to rate the recipient twice and expect a revert', async () => {
                const note = 5;
                const comment = 'A comment';

                await smartStayBooking.rateRecipient(1, note, comment);

                await expect(smartStayBooking.rateRecipient(1, note, comment)).to.be.revertedWith(
                    'SmartStay: Already rated recipient for this booking'
                );
            });
        });
    });

    describe('Tokens', async () => {
        describe('DID', async () => {
            beforeEach(async () => {
                const { _smartStayBooking, _owner, _addr1 } = await loadFixture(deploySmartStayFixture);
                smartStayBooking = _smartStayBooking;
                owner = _owner;
                addr1 = _addr1;
            });

            it('Should check that the DID collection is correctly created', async () => {
                expect(await smartStayBooking.getDIDCollection()).to.be.a.properAddress;
            });

            it('Should create a DID and check its attribute', async () => {
                const DIDMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                const firstname = 'Prénom';
                const lastname = 'Nom';
                const email = 'email@email.com';
                const registeringNumber = BigNumber.from(7511606576443);

                await smartStayBooking.createDID(
                    addr1.address,
                    DIDMetadataURI,
                    firstname,
                    lastname,
                    email,
                    registeringNumber
                );

                const DID = await smartStayBooking.getUserDID(addr1.address);

                expect(DID.tokenID).to.be.equal(1);
                expect(DID.tokenURI).to.be.equal(DIDMetadataURI);
                expect(DID.firstname).to.be.equal(firstname);
                expect(DID.lastname).to.be.equal(lastname);
                expect(DID.email).to.be.equal(email);
                expect(DID.registeringNumber).to.be.equal(registeringNumber);
            });
        });

        describe('SBT', async () => {
            const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
            const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';

            beforeEach(async () => {
                const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                    deploySmartStayFixture
                );
                smartStayRenting = _smartStayRenting;
                smartStayBooking = _smartStayBooking;
                owner = _owner;
                addr1 = _addr1;

                const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

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

                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                await smartStayBooking.approveBooking(1);

                await smartStayBooking
                    .connect(addr1)
                    .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });
            });

            it('Should check that the SBT collection is correctly created', async () => {
                expect(await smartStayBooking.getSBTCollection()).to.be.a.properAddress;
            });

            it('Should check that owner received a SBT', async () => {
                const SBTCollection = await smartStayBooking.getUserSBT(owner.address);

                expect(SBTCollection.length).to.be.equal(1);
                expect(SBTCollection[0].tokenID).to.be.equal(1);
                expect(SBTCollection[0].tokenURI).to.be.equal(ownerMetadataURI);
            });

            it('Should check that recipient received a SBT', async () => {
                const SBTCollection = await smartStayBooking.getUserSBT(addr1.address);

                expect(SBTCollection.length).to.be.equal(1);
                expect(SBTCollection[0].tokenID).to.be.equal(2);
                expect(SBTCollection[0].tokenURI).to.be.equal(recipientMetadataURI);
            });
        });

        describe('NFT', async () => {
            const NFTMetadataURI = 'https://ipfs.io/ipfs/NFTMetadataURI';
            beforeEach(async () => {
                const { _smartStayRenting, _smartStayBooking, _owner, _addr1 } = await loadFixture(
                    deploySmartStayFixture
                );
                smartStayRenting = _smartStayRenting;
                smartStayBooking = _smartStayBooking;
                owner = _owner;
                addr1 = _addr1;

                const ownerMetadataURI = 'https://ipfs.io/ipfs/ownerMetadataURI';
                const recipientMetadataURI = 'https://ipfs.io/ipfs/recipientMetadataURI';
                const amountToSend = ethers.utils.parseUnits('1.3', 'ether');

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

                const date = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                const duration = 3;

                await smartStayBooking.connect(addr1).createBooking(1, date, duration, 1);

                await smartStayBooking.approveBooking(1);

                await smartStayBooking
                    .connect(addr1)
                    .confirmBooking(1, ownerMetadataURI, recipientMetadataURI, { value: amountToSend });
            });

            it('Should check that the NFT collection is correctly created', async () => {
                expect(await smartStayBooking.getNFTCollection()).to.be.a.properAddress;
            });

            it('Should redeem a NFT and check the recipient received it', async () => {
                await smartStayBooking.connect(addr1).redeemNFT(1, NFTMetadataURI);

                const NFTCollection = await smartStayBooking.getUserNFT(addr1.address);

                expect(NFTCollection.length).to.be.equal(1);
                expect(NFTCollection[0].tokenID).to.be.equal(1);
                expect(NFTCollection[0].tokenURI).to.be.equal(NFTMetadataURI);
            });

            it('Should redeem a NFT and check owner did not received it', async () => {
                await smartStayBooking.connect(addr1).redeemNFT(1, NFTMetadataURI);

                const NFTCollection = await smartStayBooking.getUserNFT(owner.address);

                expect(NFTCollection.length).to.be.equal(0);
            });

            it('Should redeem a NFT and check booking status has been updated', async () => {
                await smartStayBooking.connect(addr1).redeemNFT(1, NFTMetadataURI);

                const booking = await smartStayBooking.getBooking(1);

                expect(booking.NFTRecipientID).to.be.equal(1);
                expect(booking.NFTRedeemed).to.be.equal(true);
            });

            it('Should redeem a NFT and emit an event', async () => {
                await expect(smartStayBooking.connect(addr1).redeemNFT(1, NFTMetadataURI))
                    .to.emit(smartStayBooking, 'BookingUpdated')
                    .withArgs(anyValue);
            });

            it('Should attempt to redeem a NFT as owner and expect a revert', async () => {
                await expect(smartStayBooking.redeemNFT(1, NFTMetadataURI)).to.be.revertedWith(
                    'SmartStay: Not recipient of the booking'
                );
            });

            it('Should attempt to redeem a NFT twice and expect a revert', async () => {
                await smartStayBooking.connect(addr1).redeemNFT(1, NFTMetadataURI);
                await expect(smartStayBooking.connect(addr1).redeemNFT(1, NFTMetadataURI)).to.be.revertedWith(
                    'SmartStay: NFT already redeemed'
                );
            });
        });
    });
});

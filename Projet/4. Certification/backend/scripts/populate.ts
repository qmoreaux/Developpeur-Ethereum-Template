import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import * as fs from 'fs';
import {
    SmartStayRenting,
    SmartStayRenting__factory,
    SmartStayBooking,
    SmartStayBooking__factory,
    SmartStayMarketplace,
    SmartStayMarketplace__factory
} from '../typechain-types';

const filename: string = '../frontend/contracts/SmartStay.json';
const fileContentJSON = JSON.parse(fs.readFileSync(filename, 'utf-8'));
const chainID = 1337;
let owner: any;
let addr1: any;
let SmartStayRenting: SmartStayRenting__factory;
let smartStayRenting: SmartStayRenting;
let SmartStayBooking: SmartStayBooking__factory;
let smartStayBooking: SmartStayBooking;
let SmartStayMarketplace: SmartStayMarketplace__factory;
let smartStayMarketplace: SmartStayMarketplace;

const getSmartStayRentingAddress = () => {
    return fileContentJSON.SmartStayRenting.networks[chainID].address;
};

const getSmartStayBookingAddress = () => {
    return fileContentJSON.SmartStayBooking.networks[chainID].address;
};

const getSmartStayMarketplaceAddress = () => {
    return fileContentJSON.SmartStayMarketplace.networks[chainID].address;
};

const main = async () => {
    await init();
    await createDID();
    await createRentings();
    await createBooking();
    await approveBookings();
    await rejectBookings();
    await confirmBookings();
    await validateBookingsAsOwner();
    await validateBookingsAsRecipient();
    await retrieveDeposit();
    await retrieveAmount();
    await rateOwner();
    await rateRecipient();
    await redeemNFT();
};

const init = async () => {
    SmartStayRenting = await ethers.getContractFactory('SmartStayRenting');
    smartStayRenting = SmartStayRenting.attach(getSmartStayRentingAddress());
    SmartStayBooking = await ethers.getContractFactory('SmartStayBooking');
    smartStayBooking = SmartStayBooking.attach(getSmartStayBookingAddress());
    SmartStayMarketplace = await ethers.getContractFactory('SmartStayMarketplace');
    smartStayMarketplace = SmartStayMarketplace.attach(getSmartStayMarketplaceAddress());

    const [_owner, _addr1] = await ethers.getSigners();
    owner = _owner;
    addr1 = _addr1;
};

const createDID = async () => {
    await smartStayBooking.createDID(
        owner.address,
        'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/did/1.json',
        'Jean',
        'Dupont',
        'jean.dupont@gmail.com',
        123456789
    );
    await smartStayBooking.createDID(
        addr1.address,
        'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/did/2.json',
        'Test',
        'Test',
        'test.test@gmail.com',
        987654321
    );
};

const createRentings = async () => {
    await smartStayRenting.createRenting({
        id: 0,
        owner: ethers.constants.AddressZero,
        unitPrice: ethers.utils.parseUnits('0.1', 'ether'),
        deposit: ethers.utils.parseUnits('1', 'ether'),
        personCount: BigNumber.from(1),
        location: 'Paris',
        tags: ['Maison', 'Bord de mer'],
        description: 'Une jolie maison',
        imageURL: 'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/image/1.jpg'
    });

    await smartStayRenting.createRenting({
        id: 0,
        owner: ethers.constants.AddressZero,
        unitPrice: ethers.utils.parseUnits('0.5', 'ether'),
        deposit: ethers.utils.parseUnits('2', 'ether'),
        personCount: BigNumber.from(5),
        location: 'Marseille',
        tags: ['Appartement'],
        description: 'Une jolie maison',
        imageURL: 'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/image/2.jpg'
    });

    await smartStayRenting.connect(addr1).createRenting({
        id: 0,
        owner: ethers.constants.AddressZero,
        unitPrice: ethers.utils.parseUnits('1', 'ether'),
        deposit: ethers.utils.parseUnits('2', 'ether'),
        personCount: BigNumber.from(5),
        location: 'Lyon',
        tags: ['Appartement'],
        description: 'Un chateau',
        imageURL: 'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/image/3.jpg'
    });

    await smartStayRenting.connect(addr1).createRenting({
        id: 0,
        owner: ethers.constants.AddressZero,
        unitPrice: ethers.utils.parseUnits('0.01', 'ether'),
        deposit: ethers.utils.parseUnits('0.5', 'ether'),
        personCount: BigNumber.from(10),
        location: 'Toulouse',
        tags: ['Bord de mer'],
        description: 'Une description',
        imageURL: 'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/image/4.jpg'
    });

    console.log('Create Rentings : OK');
};

const createBooking = async () => {
    const oneWeekAgo = Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 7;
    const oneDayAgo = Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 1;
    const oneDayAfter = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 1;
    await smartStayBooking.createBooking(3, oneWeekAgo, 3, 1);
    await smartStayBooking.createBooking(3, oneWeekAgo, 3, 1);
    await smartStayBooking.createBooking(4, oneWeekAgo, 3, 3);
    await smartStayBooking.createBooking(4, oneWeekAgo, 3, 2);
    await smartStayBooking.createBooking(3, oneWeekAgo, 3, 1);
    await smartStayBooking.createBooking(3, oneWeekAgo, 3, 4);
    await smartStayBooking.createBooking(4, oneWeekAgo, 3, 4);
    await smartStayBooking.createBooking(4, oneDayAgo, 3, 5);
    await smartStayBooking.createBooking(3, oneDayAfter, 3, 1);

    await smartStayBooking.connect(addr1).createBooking(1, oneWeekAgo, 3, 1);
    await smartStayBooking.connect(addr1).createBooking(1, oneWeekAgo, 3, 1);
    await smartStayBooking.connect(addr1).createBooking(2, oneWeekAgo, 3, 4);
    await smartStayBooking.connect(addr1).createBooking(2, oneWeekAgo, 3, 3);
    await smartStayBooking.connect(addr1).createBooking(1, oneWeekAgo, 3, 1);
    await smartStayBooking.connect(addr1).createBooking(1, oneWeekAgo, 3, 1);
    await smartStayBooking.connect(addr1).createBooking(2, oneWeekAgo, 3, 2);
    await smartStayBooking.connect(addr1).createBooking(2, oneDayAgo, 3, 4);
    await smartStayBooking.connect(addr1).createBooking(1, oneDayAfter, 3, 1);

    console.log('Create Bookings : OK');
};

const approveBookings = async () => {
    await smartStayBooking.approveBooking(12);
    await smartStayBooking.approveBooking(13);
    await smartStayBooking.approveBooking(14);
    await smartStayBooking.approveBooking(15);
    await smartStayBooking.approveBooking(16);
    await smartStayBooking.approveBooking(17);
    await smartStayBooking.approveBooking(18);

    await smartStayBooking.connect(addr1).approveBooking(3);
    await smartStayBooking.connect(addr1).approveBooking(4);
    await smartStayBooking.connect(addr1).approveBooking(5);
    await smartStayBooking.connect(addr1).approveBooking(6);
    await smartStayBooking.connect(addr1).approveBooking(7);
    await smartStayBooking.connect(addr1).approveBooking(8);
    await smartStayBooking.connect(addr1).approveBooking(9);

    console.log('Approve Bookings : OK');
};

const rejectBookings = async () => {
    await smartStayBooking.rejectBooking(11);

    await smartStayBooking.connect(addr1).rejectBooking(2);

    console.log('Reject Bookings : OK');
};

const confirmBookings = async () => {
    const SBTOwner = 'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/sbt/owner.json';
    const SBTRecipient = 'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/sbt/recipient.json';

    await smartStayBooking.confirmBooking(4, SBTOwner, SBTRecipient, {
        value: ethers.utils.parseUnits('0.53', 'ether')
    });
    await smartStayBooking.confirmBooking(5, SBTOwner, SBTRecipient, {
        value: ethers.utils.parseUnits('5', 'ether')
    });
    await smartStayBooking.confirmBooking(6, SBTOwner, SBTRecipient, {
        value: ethers.utils.parseUnits('5', 'ether')
    });
    await smartStayBooking.confirmBooking(7, SBTOwner, SBTRecipient, {
        value: ethers.utils.parseUnits('0.53', 'ether')
    });
    await smartStayBooking.confirmBooking(8, SBTOwner, SBTRecipient, {
        value: ethers.utils.parseUnits('0.53', 'ether')
    });
    await smartStayBooking.confirmBooking(9, SBTOwner, SBTRecipient, {
        value: ethers.utils.parseUnits('5', 'ether')
    });

    await smartStayBooking
        .connect(addr1)
        .confirmBooking(13, SBTOwner, SBTRecipient, { value: ethers.utils.parseUnits('3.5', 'ether') });
    await smartStayBooking
        .connect(addr1)
        .confirmBooking(14, SBTOwner, SBTRecipient, { value: ethers.utils.parseUnits('1.3', 'ether') });
    await smartStayBooking
        .connect(addr1)
        .confirmBooking(15, SBTOwner, SBTRecipient, { value: ethers.utils.parseUnits('1.3', 'ether') });
    await smartStayBooking
        .connect(addr1)
        .confirmBooking(16, SBTOwner, SBTRecipient, { value: ethers.utils.parseUnits('3.5', 'ether') });
    await smartStayBooking
        .connect(addr1)
        .confirmBooking(17, SBTOwner, SBTRecipient, { value: ethers.utils.parseUnits('3.5', 'ether') });
    await smartStayBooking
        .connect(addr1)
        .confirmBooking(18, SBTOwner, SBTRecipient, { value: ethers.utils.parseUnits('1.3', 'ether') });

    console.log('Confirm Bookings : OK');
};

const validateBookingsAsOwner = async () => {
    await smartStayBooking.validateBookingAsOwner(14);
    await smartStayBooking.validateBookingAsOwner(15);
    await smartStayBooking.validateBookingAsOwner(16);

    await smartStayBooking.connect(addr1).validateBookingAsOwner(4);
    await smartStayBooking.connect(addr1).validateBookingAsOwner(5);
    await smartStayBooking.connect(addr1).validateBookingAsOwner(6);
    await smartStayBooking.connect(addr1).validateBookingAsOwner(7);

    console.log('Validate Bookings as owner : OK');
};

const validateBookingsAsRecipient = async () => {
    await smartStayBooking.validateBookingAsRecipient(5);
    await smartStayBooking.validateBookingAsRecipient(6);
    await smartStayBooking.validateBookingAsRecipient(7);

    await smartStayBooking.connect(addr1).validateBookingAsRecipient(14);
    await smartStayBooking.connect(addr1).validateBookingAsRecipient(15);
    await smartStayBooking.connect(addr1).validateBookingAsRecipient(16);

    console.log('Validate Bookings as recipient : OK');
};

const retrieveDeposit = async () => {
    const SBTRecipient = 'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/sbt/recipient.json';

    await smartStayBooking.retrieveDeposit(6, SBTRecipient);
    await smartStayBooking.retrieveDeposit(7, SBTRecipient);

    await smartStayBooking.connect(addr1).retrieveDeposit(15, SBTRecipient);
    await smartStayBooking.connect(addr1).retrieveDeposit(16, SBTRecipient);

    console.log('Retrieve deposit : OK');
};

const retrieveAmount = async () => {
    const SBTOwner = 'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/sbt/owner.json';

    await smartStayBooking.retrieveAmount(15, SBTOwner);
    await smartStayBooking.retrieveAmount(16, SBTOwner);

    await smartStayBooking.connect(addr1).retrieveAmount(7, SBTOwner);

    console.log('Retrieve amount : OK');
};

const rateOwner = async () => {
    await smartStayBooking.rateOwner(7, 5, 'Très joli');

    await smartStayBooking.connect(addr1).rateOwner(15, 2, 'Pas super');
    await smartStayBooking.connect(addr1).rateOwner(16, 5, 'Très joli');

    console.log('Rate owner : OK');
};

const rateRecipient = async () => {
    await smartStayBooking.rateRecipient(15, 5, 'Rien cassé');
    await smartStayBooking.rateRecipient(16, 0, 'A volé la télé');

    await smartStayBooking.connect(addr1).rateRecipient(7, 2, 'Super gentil');

    console.log('Rate recipient : OK');
};

const redeemNFT = async () => {
    const NFTURI = 'https://ipfs.io/ipfs/QmaW3PJgkFNpGa3vr5oEWSpHYUCk2WpRikemc9HYhxJ1cY/nft/';
    await smartStayBooking.redeemNFT(5, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');
    await smartStayBooking.redeemNFT(6, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');
    await smartStayBooking.redeemNFT(7, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');
    await smartStayBooking.redeemNFT(8, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');
    await smartStayBooking.redeemNFT(9, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');

    await smartStayBooking.connect(addr1).redeemNFT(13, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');
    await smartStayBooking.connect(addr1).redeemNFT(14, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');
    await smartStayBooking.connect(addr1).redeemNFT(15, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');
    await smartStayBooking.connect(addr1).redeemNFT(16, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');
    await smartStayBooking.connect(addr1).redeemNFT(17, NFTURI + (Math.floor(Math.random() * 10) + 1) + '.json');

    console.log('Redeem NFT : OK');
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

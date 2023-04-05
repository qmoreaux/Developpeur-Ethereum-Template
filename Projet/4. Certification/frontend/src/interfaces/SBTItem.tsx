import { BigNumber } from 'ethers';

interface Attributes {
    trait_type: string;
    value: any;
}

export default interface ISBTItem {
    tokenID: BigNumber;
    tokenURI: string;
    name: string;
    image: string;
    description: string;
    attributes: Array<Attributes>;
    bookingID: BigNumber;
    duration: BigNumber;
    price: BigNumber;
    location: string;
    owner: string;
}

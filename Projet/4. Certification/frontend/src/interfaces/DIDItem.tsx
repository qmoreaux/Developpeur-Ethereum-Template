import { BigNumber } from 'ethers';

interface Attributes {
    trait_type: string;
    value: any;
}

export default interface IDIDItem {
    tokenID: BigNumber;
    tokenURI: string;
    firstname: string;
    lastname: string;
    email: string;
    registeringNumber: BigNumber;
    attributes: Array<Attributes>;
}

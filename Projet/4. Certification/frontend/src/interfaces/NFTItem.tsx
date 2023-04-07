import { BigNumber } from 'ethers';

interface Attributes {
    trait_type: string;
    value: any;
}

export default interface INFTItem {
    tokenID: BigNumber;
    tokenURI: string;
    price: BigNumber;
    name: string;
    image: string;
    description: string;
    attributes: Array<Attributes>;
}

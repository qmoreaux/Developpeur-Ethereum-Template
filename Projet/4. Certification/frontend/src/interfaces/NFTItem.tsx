import { BigNumber } from 'ethers';

interface Attributes {
    trait_type: string;
    value: any;
}

export default interface INFTItem {
    tokenID: BigNumber;
    tokenURI: string;
    name: string;
    description: string;
    attributes: Array<Attributes>;
}

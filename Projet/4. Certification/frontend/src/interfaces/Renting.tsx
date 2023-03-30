import { BigNumber } from 'ethers';

export default interface IRenting {
    id: BigNumber;
    unitPrice: BigNumber;
    deposit: BigNumber;
    owner: string;
    personCount: number;
    location: string;
    tags: Array<string>;
    description: string;
    imageURL: string;
}

import { BigNumber } from "ethers";

export default interface IRenting {
    id: BigNumber;
    unitPrice: number;
    personCount: number;
    location: string;
    tags: Array<string>;
    description: string;
    imageURL: string;
}

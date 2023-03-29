import { BigNumber } from 'ethers';

export default interface INFTItem {
    tokenID: BigNumber;
    name: string;
    description: string;
    attributes: Array<any>;
}

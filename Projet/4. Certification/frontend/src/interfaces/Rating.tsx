import { BigNumber } from 'ethers';

export default interface IRating {
    id: BigNumber;
    note: number;
    owner: boolean;
    comment: string;
    from: string;
}

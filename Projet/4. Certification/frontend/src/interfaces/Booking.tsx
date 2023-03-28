import { BigNumber } from 'ethers';

export default interface IBooking {
    id: BigNumber;
    rentingID: BigNumber;
    amountLocked: BigNumber;
    cautionLocked: BigNumber;
    personCount: BigNumber;
    duration: BigNumber;
    timestampStart: BigNumber;
    timestampEnd: BigNumber;
    validatedOwner: boolean;
    validatedRecipient: boolean;
    status: number;
}

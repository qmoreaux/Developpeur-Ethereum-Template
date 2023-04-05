import { BigNumber } from 'ethers';

export default interface IBooking {
    id: BigNumber;
    rentingID: BigNumber;
    amountLocked: BigNumber;
    depositLocked: BigNumber;
    personCount: BigNumber;
    duration: BigNumber;
    timestampStart: BigNumber;
    timestampEnd: BigNumber;
    validatedOwner: boolean;
    validatedRecipient: boolean;
    NFTRedeemed: boolean;
    status: number;
    ratedOwner: boolean;
    ratedRecipient: boolean;
    recipient: string;
}

import { BigNumber } from "ethers";

export default interface IBooking {
    id: BigNumber;
    rentingID: BigNumber;
    amountLocked: BigNumber;
    cautionLocked: BigNumber;
    timestampStart: number;
    personCount: number;
    duration: number;
    status: number;
    timestampEnd: number;
}

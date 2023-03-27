import { BigNumber } from "ethers";

export default interface BookingInterface {
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

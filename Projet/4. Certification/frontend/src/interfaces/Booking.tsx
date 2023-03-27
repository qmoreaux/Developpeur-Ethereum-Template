import { BigNumber } from "ethers";

export default interface BookingInterface {
    id: BigNumber;
    rentingID: BigNumber;
    amountPayed: BigNumber;
    cautionPayed: BigNumber;
    timestampStart: number;
    personCount: number;
    duration: number;
    status: number;
    timestampEnd: number;
}

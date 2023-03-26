import { BigNumber } from "ethers";

export default interface BookingInterface {
    id: BigNumber;
    timestampStart: number;
    personCount: number;
    duration: number;
}

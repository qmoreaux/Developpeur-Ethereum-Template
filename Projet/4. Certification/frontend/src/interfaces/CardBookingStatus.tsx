import IBooking from './Booking';

export default interface ICardBookingStatus {
    booking: IBooking;
    setBooking: Function;
    type: string;
}

import { Typography } from '@mui/material';

import ICardBookingStatus from '@/interfaces/CardBookingStatus';

export default function Completed({ booking, setBooking, type }: ICardBookingStatus) {
    return (
        <>
            <Typography>This booking is completed</Typography>
        </>
    );
}

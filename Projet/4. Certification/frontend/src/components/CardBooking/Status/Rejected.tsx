import { Typography } from '@mui/material';

import ICardBookingStatus from '@/interfaces/CardBookingStatus';

export default function Rejected({ booking, setBooking, type }: ICardBookingStatus) {
    return (
        <>
            {type === 'owner' ? (
                <Typography>You rejected this booking</Typography>
            ) : (
                <Typography>The owner rejected this booking</Typography>
            )}
        </>
    );
}

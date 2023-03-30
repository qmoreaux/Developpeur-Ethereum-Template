import { Typography } from '@mui/material';

import ICardBookingStatus from '@/interfaces/CardBookingStatus';

export default function Cancelled({ booking, setBooking, type }: ICardBookingStatus) {
    return (
        <>
            {type === 'owner' ? (
                <Typography>This booking was cancelled</Typography>
            ) : (
                <Typography>You cancelled this booking</Typography>
            )}
        </>
    );
}

import { Typography } from '@mui/material';

export default function Cancelled({ booking, setBooking, type }: any) {
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

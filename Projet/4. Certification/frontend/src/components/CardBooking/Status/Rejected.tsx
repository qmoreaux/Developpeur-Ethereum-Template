import { Typography } from '@mui/material';

export default function Rejected({ booking, setBooking, type }: any) {
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

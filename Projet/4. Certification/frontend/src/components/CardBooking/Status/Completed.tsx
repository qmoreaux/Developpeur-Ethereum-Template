import { useState } from 'react';

import { Typography, TextField, Grid, Stack, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useAccount } from 'wagmi';

import { useAlertContext, useContractContext } from '@/context';

import ICardBookingStatus from '@/interfaces/CardBookingStatus';

export default function Completed({ booking, setBooking, type }: ICardBookingStatus) {
    const { address } = useAccount();

    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const [note, setNote] = useState(5);
    const [comment, setComment] = useState('');
    const [loadingPublish, setLoadingPublish] = useState(false);

    const publishOwnerRating = async () => {
        setLoadingPublish(false);

        try {
            const transaction = await writeContract('SmartStayBooking', 'rateOwner', [
                booking.id.toNumber(),
                note,
                comment,
                { from: address }
            ]);
            await transaction.wait();

            setAlert({ message: 'Your rating has been sent', severity: 'success' });

            setBooking({
                ...booking,
                validatedOwner: true,
                status: booking.validatedRecipient ? 3 : 2
            });
            setLoadingPublish(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingPublish(false);
            console.error(e);
        }
    };

    const publishRecipientRating = async () => {
        setLoadingPublish(false);

        try {
            const transaction = await writeContract('SmartStayBooking', 'rateRecipient', [
                booking.id.toNumber(),
                note,
                comment,
                { from: address }
            ]);
            await transaction.wait();

            setAlert({ message: 'Your rating has been sent', severity: 'success' });

            setBooking({
                ...booking,
                validatedOwner: true,
                status: booking.validatedRecipient ? 3 : 2
            });
            setLoadingPublish(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingPublish(false);
            console.error(e);
        }
    };

    return (
        <Stack>
            <Typography textAlign={'center'}>This booking is completed</Typography>
            {type === 'owner' ? (
                <>
                    {!booking.ratedRecipient ? (
                        <>
                            <Divider sx={{ margin: '1rem 0' }} />
                            <Typography textAlign={'center'}>Please rate the recipient of the booking</Typography>
                            <Grid container>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(0)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 0 ? '#1565c0' : 'initial',
                                            color: note === 0 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        0
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(1)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 1 ? '#1565c0' : 'initial',
                                            color: note === 1 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        1
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(2)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 2 ? '#1565c0' : 'initial',
                                            color: note === 2 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        2
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(3)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 3 ? '#1565c0' : 'initial',
                                            color: note === 3 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        3
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(4)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 4 ? '#1565c0' : 'initial',
                                            color: note === 4 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        4
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(5)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 5 ? '#1565c0' : 'initial',
                                            color: note === 5 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        5
                                    </Typography>
                                </Grid>
                            </Grid>
                            <TextField
                                label="Comment"
                                multiline
                                rows={3}
                                sx={{ width: '300px', margin: '1rem 0' }}
                                onChange={(event) => {
                                    setComment(event.target.value);
                                }}
                            />
                            <LoadingButton
                                loading={loadingPublish}
                                variant="contained"
                                onClick={publishRecipientRating}
                            >
                                Publish
                            </LoadingButton>
                        </>
                    ) : (
                        ''
                    )}
                </>
            ) : (
                <>
                    {!booking.ratedOwner ? (
                        <>
                            <Divider sx={{ margin: '1rem 0' }} />
                            <Typography textAlign={'center'}>Please rate the recipient of the booking</Typography>
                            <Grid container>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(0)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 0 ? '#1565c0' : 'initial',
                                            color: note === 0 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        0
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(1)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 1 ? '#1565c0' : 'initial',
                                            color: note === 1 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        1
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(2)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 2 ? '#1565c0' : 'initial',
                                            color: note === 2 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        2
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(3)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 3 ? '#1565c0' : 'initial',
                                            color: note === 3 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        3
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(4)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 4 ? '#1565c0' : 'initial',
                                            color: note === 4 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        4
                                    </Typography>
                                </Grid>
                                <Grid flexGrow={1} textAlign={'center'} item onClick={() => setNote(5)}>
                                    <Typography
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: note === 5 ? '#1565c0' : 'initial',
                                            color: note === 5 ? 'white' : 'initial',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '20px',
                                            margin: 'auto',
                                            padding: '8px'
                                        }}
                                    >
                                        5
                                    </Typography>
                                </Grid>
                            </Grid>
                            <TextField
                                label="Comment"
                                multiline
                                rows={3}
                                sx={{ width: '300px', margin: '1rem 0' }}
                                onChange={(event) => {
                                    setComment(event.target.value);
                                }}
                            />
                            <LoadingButton loading={loadingPublish} variant="contained" onClick={publishOwnerRating}>
                                Publish
                            </LoadingButton>
                        </>
                    ) : (
                        ''
                    )}
                </>
            )}
        </Stack>
    );
}

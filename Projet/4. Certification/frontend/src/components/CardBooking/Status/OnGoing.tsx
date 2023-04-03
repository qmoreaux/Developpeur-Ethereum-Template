import { useState } from 'react';

import { Button, Typography, Stack, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useAccount } from 'wagmi';

import { useAlertContext, useContractContext } from '@/context';

import ICardBookingStatus from '@/interfaces/CardBookingStatus';

export default function OnGoing({ booking, setBooking, type }: ICardBookingStatus) {
    const { address } = useAccount();

    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const [loadingCancel, setLoadingCancel] = useState(false);
    const [loadingValidate, setLoadingValidate] = useState(false);

    const handleCancelBooking = async () => {
        setLoadingCancel(true);
        try {
            const transaction = await writeContract('cancelBooking', [booking.id, { from: address }]);
            await transaction.wait();

            setAlert({ message: 'You have successfully canceled the booking', severity: 'success' });

            setBooking({ ...booking, status: 6 });
            setLoadingCancel(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingCancel(false);
            console.error(e);
        }
    };

    const handleValidateBookingAsOwner = async () => {
        setLoadingValidate(true);
        try {
            const transaction = await writeContract('validateBookingAsOwner', [
                booking.id.toNumber(),
                { from: address }
            ]);
            await transaction.wait();

            setAlert({ message: 'You have successfully validated the booking', severity: 'success' });

            setBooking({
                ...booking,
                validatedOwner: true,
                status: booking.validatedRecipient ? 3 : 2
            });
            setLoadingValidate(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingValidate(false);
            console.error(e);
        }
    };

    const handleValidateBookingAsRecipient = async () => {
        setLoadingValidate(true);
        try {
            const transaction = await writeContract('validateBookingAsRecipient', [
                booking.id.toNumber(),
                { from: address }
            ]);
            await transaction.wait();

            setAlert({ message: 'You have successfully validated the booking', severity: 'success' });

            setBooking({
                ...booking,
                validatedRecipient: true,
                status: booking.validatedOwner ? 3 : 2
            });
            setLoadingValidate(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingValidate(false);
            console.error(e);
        }
    };

    const isBookingStarted = (): boolean => {
        return new Date().getTime() / 1000 > booking.timestampStart.toNumber();
    };

    const isBookingEnded = (): boolean => {
        return new Date().getTime() / 1000 > booking.timestampEnd.toNumber();
    };

    const getTimeToDate = (timestampEnd: number) => {
        const data = {
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0
        };
        const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
        const DAYS_IN_SECONDS = 60 * 60 * 24;
        const HOURS_IN_SECONDS = 60 * 60;
        const MINUTES_IN_SECONDS = 60;
        let timeToEnd: number = Math.trunc(timestampEnd - new Date().getTime() / 1000);
        data.weeks = Math.trunc(timeToEnd / WEEK_IN_SECONDS);
        timeToEnd %= WEEK_IN_SECONDS;
        data.days = Math.trunc(timeToEnd / DAYS_IN_SECONDS);
        timeToEnd %= DAYS_IN_SECONDS;
        data.hours = Math.trunc(timeToEnd / HOURS_IN_SECONDS);
        timeToEnd %= HOURS_IN_SECONDS;
        data.minutes = Math.trunc(timeToEnd / MINUTES_IN_SECONDS);
        timeToEnd %= MINUTES_IN_SECONDS;

        return `${data.weeks ? data.weeks + ' weeks, ' : ''}${data.days ? data.days + ' days, ' : ''}${
            data.hours ? data.hours + ' hours, ' : ''
        }${data.minutes ? data.minutes + ' minutes' : ''}`;
    };

    return (
        <Stack width="100%">
            {isBookingEnded() ? (
                <>
                    {type === 'owner' ? (
                        <>
                            {booking.validatedOwner ? (
                                <Typography>Please wait for the recipient to validate the booking</Typography>
                            ) : (
                                <Box display="flex" justifyContent="space-between">
                                    <LoadingButton
                                        loading={loadingValidate}
                                        variant="contained"
                                        onClick={handleValidateBookingAsOwner}
                                    >
                                        Validate booking
                                    </LoadingButton>
                                    <Button variant="contained" color="error">
                                        Express reservations
                                    </Button>
                                </Box>
                            )}
                        </>
                    ) : (
                        <>
                            <>
                                {booking.validatedRecipient ? (
                                    <Typography>Please wait for the owner to validate the booking</Typography>
                                ) : (
                                    <Box display="flex" justifyContent="space-between">
                                        <LoadingButton
                                            loading={loadingValidate}
                                            variant="contained"
                                            onClick={handleValidateBookingAsRecipient}
                                        >
                                            Validate booking
                                        </LoadingButton>
                                        <Button variant="contained" color="error">
                                            Express reservations
                                        </Button>
                                    </Box>
                                )}
                            </>
                        </>
                    )}
                </>
            ) : (
                <>
                    {isBookingStarted() ? (
                        ''
                    ) : (
                        <>
                            {type === 'recipient' ? (
                                <LoadingButton
                                    loading={loadingCancel}
                                    variant="contained"
                                    color="warning"
                                    onClick={handleCancelBooking}
                                >
                                    Cancel booking
                                </LoadingButton>
                            ) : (
                                ''
                            )}
                            <Typography>
                                Booking starts in : <b>{getTimeToDate(booking.timestampStart.toNumber())}</b>
                            </Typography>
                        </>
                    )}
                    <Typography>
                        Booking ends in : <b>{getTimeToDate(booking.timestampEnd.toNumber())}</b>
                    </Typography>
                </>
            )}
        </Stack>
    );
}

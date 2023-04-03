import { useState } from 'react';

import { Typography, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ethers, BigNumber } from 'ethers';
import { useAccount } from 'wagmi';

import { useAlertContext, useContractContext } from '@/context';

import ICardBookingStatus from '@/interfaces/CardBookingStatus';

export default function Validated({ booking, setBooking, type }: ICardBookingStatus) {
    const { address } = useAccount();

    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const [loadingRetrieve, setLoadingRetrieve] = useState(false);

    const handleRetrieveDeposit = async () => {
        setLoadingRetrieve(true);
        try {
            const transaction = await writeContract('retrieveDeposit', [booking.id.toNumber(), { from: address }]);
            await transaction.wait();

            setAlert({ message: 'You have successfully retrieved your deposit', severity: 'success' });

            setBooking({
                ...booking,
                depositLocked: BigNumber.from(0),
                status: booking.amountLocked.toString() === '0' ? 4 : 3
            });
            setLoadingRetrieve(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingRetrieve(false);
            console.error(e);
        }
    };

    const handleRetrieveAmount = async () => {
        setLoadingRetrieve(true);
        try {
            const transaction = await writeContract('retrieveAmount', [booking.id.toNumber(), { from: address }]);
            await transaction.wait();

            setAlert({ message: 'You have successfully retrieved your amount', severity: 'success' });

            setBooking({
                ...booking,
                amountLocked: BigNumber.from(0),
                status: booking.depositLocked.toString() === '0' ? 4 : 3
            });
            setLoadingRetrieve(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingRetrieve(false);
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
        <>
            {type === 'owner' ? (
                <Stack>
                    <Typography>
                        Amount to get :<b> {ethers.utils.formatEther(booking.amountLocked)} ETH</b>
                    </Typography>
                    {isBookingEnded() ? (
                        <>
                            {booking.amountLocked.toString() !== '0' ? (
                                <LoadingButton
                                    loading={loadingRetrieve}
                                    variant="contained"
                                    onClick={handleRetrieveAmount}
                                >
                                    Retrieve amount
                                </LoadingButton>
                            ) : (
                                <Typography>Already retrieved</Typography>
                            )}
                        </>
                    ) : (
                        <>
                            {isBookingStarted() ? (
                                ''
                            ) : (
                                <Typography>
                                    Booking starts in : {getTimeToDate(booking.timestampStart.toNumber())}
                                </Typography>
                            )}
                            <Typography>Booking ends in : {getTimeToDate(booking.timestampEnd.toNumber())}</Typography>
                        </>
                    )}
                </Stack>
            ) : (
                <Stack>
                    <Typography>
                        Amount to get :<b> {ethers.utils.formatEther(booking.depositLocked)} ETH</b>
                    </Typography>
                    {isBookingEnded() ? (
                        <>
                            {booking.depositLocked.toString() !== '0' ? (
                                <LoadingButton
                                    loading={loadingRetrieve}
                                    variant="contained"
                                    onClick={handleRetrieveDeposit}
                                >
                                    Retrieve deposit
                                </LoadingButton>
                            ) : (
                                <Typography>Already retrieved</Typography>
                            )}
                        </>
                    ) : (
                        <>
                            {isBookingStarted() ? (
                                ''
                            ) : (
                                <Typography>
                                    Booking starts in : {getTimeToDate(booking.timestampStart.toNumber())}
                                </Typography>
                            )}
                            <Typography>Booking ends in : {getTimeToDate(booking.timestampEnd.toNumber())}</Typography>
                        </>
                    )}
                </Stack>
            )}
        </>
    );
}

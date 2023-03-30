import { useState } from 'react';

import { Typography, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ethers, BigNumber } from 'ethers';
import { useNetwork, useSigner, useAccount } from 'wagmi';

import { useAlertContext } from '@/context';

import artifacts from '../../../../contracts/SmartStay.json';

import IBooking from '../../../interfaces/Booking';
import INetworks from '../../../interfaces/Networks';

export default function Validated({ booking, setBooking, type }: any) {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const { setAlert } = useAlertContext();

    const [loadingRetrieve, setLoadingRetrieve] = useState(false);

    const handleRetrieveCaution = async () => {
        if (signer && chain && chain.id) {
            setLoadingRetrieve(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.retrieveCaution(booking.id.toNumber(), { from: address });
                await transaction.wait();

                setAlert({ message: 'You have successfully retrieved your deposit', severity: 'success' });

                setBooking({
                    ...booking,
                    cautionLocked: BigNumber.from(0),
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
        }
    };

    const handleRetrieveAmount = async () => {
        if (signer && chain && chain.id) {
            setLoadingRetrieve(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.retrieveAmount(booking.id.toNumber(), { from: address });
                await transaction.wait();

                setAlert({ message: 'You have successfully retrieved your amount', severity: 'success' });

                setBooking({
                    ...booking,
                    amountLocked: BigNumber.from(0),
                    status: booking.cautionLocked.toString() === '0' ? 4 : 3
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
                                    onClick={() => handleRetrieveAmount()}
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
                        Amount to get :<b> {ethers.utils.formatEther(booking.cautionLocked)} ETH</b>
                    </Typography>
                    {isBookingEnded() ? (
                        <>
                            {booking.cautionLocked.toString() !== '0' ? (
                                <LoadingButton
                                    loading={loadingRetrieve}
                                    variant="contained"
                                    onClick={() => handleRetrieveCaution()}
                                >
                                    Retrieve caution
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

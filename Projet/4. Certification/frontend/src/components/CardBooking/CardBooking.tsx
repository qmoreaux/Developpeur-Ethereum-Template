import { useState } from 'react';

import { ethers, BigNumber, ContractInterface } from 'ethers';
import { useNetwork, useProvider, useSigner, useAccount } from 'wagmi';
import { Button, Typography, Box, Card, CardContent, Stack } from '@mui/material';

import artifacts from '../../../contracts/SmartStay.json';

import IBooking from '../../interfaces/Booking';
import INetworks from '../../interfaces/Networks';

export default function CardBooking({ _booking, type }: any) {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();
    const { data: signer } = useSigner();

    const [booking, setBooking] = useState<IBooking>(_booking);

    const getRenting = async (bookingID: number) => {
        if (provider && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    provider
                );
                const renting = await contract.getRentingFromBookingID(bookingID, { from: address });
                return renting;
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleRejectBooking = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.rejectBooking(booking.id);
                await transaction.wait();

                setBooking({ ...booking, status: 1 });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleAcceptBooking = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.approveBooking(booking.id);
                await transaction.wait();

                setBooking({ ...booking, status: 2 });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handlePayBooking = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                let renting = await getRenting(booking.id.toNumber());
                const transaction = await contract.confirmBooking(booking.id.toNumber(), {
                    value: renting.unitPrice.mul(booking.duration).add(renting.caution)
                });
                await transaction.wait();

                setBooking({ ...booking, status: 3 });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleValidateBookingAsOwner = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.validateBookingAsOwner(booking.id.toNumber());
                await transaction.wait();
                setBooking({
                    ..._booking,
                    validatedOwner: true,
                    status: booking.validatedRecipient ? 4 : 3
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleValidateBookingAsRecipient = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.validateBookingAsRecipient(booking.id.toNumber());
                await transaction.wait();
                setBooking({
                    ..._booking,
                    validatedRecipient: true,
                    status: booking.validatedOwner ? 4 : 3
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleRetrieveCaution = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.retrieveCaution(booking.id.toNumber());
                await transaction.wait();
                setBooking({
                    ..._booking,
                    cautionLocked: BigNumber.from(0),
                    status: booking.amountLocked.toString() === '0' ? 5 : 4
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleRetrieveAmount = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.retrieveAmount(booking.id.toNumber());
                await transaction.wait();
                setBooking({
                    ..._booking,
                    amountLocked: BigNumber.from(0),
                    status: booking.cautionLocked.toString() === '0' ? 5 : 4
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const isBookingEnded = (): boolean => {
        return new Date().getTime() / 1000 > booking.timestampEnd.toNumber();
    };

    const getTimeToEnd = (timestampEnd: number) => {
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

        return `Booking ends in : ${data.weeks ? data.weeks + ' weeks, ' : ''}${
            data.days ? data.days + ' days, ' : ''
        }${data.hours ? data.hours + ' hours, ' : ''}${data.minutes ? data.minutes + ' minutes' : ''}`;
    };

    return (
        <>
            {booking && booking.id ? (
                <Card
                    sx={{
                        backgroundColor: 'whitesmoke',
                        width: '400px',
                        boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                        marginBottom: '1rem'
                    }}
                >
                    <CardContent>
                        <Typography>Booking ID : #{booking.id.toString()}</Typography>
                        <Typography>
                            {' '}
                            Start date : {new Date(booking.timestampStart.toNumber() * 1000).toLocaleDateString()}
                        </Typography>
                        <Typography>Person count: {booking.personCount.toString()}</Typography>
                        <Typography>Duration : {booking.duration.toString()} days</Typography>
                        <Box display="flex" justifyContent="center" mt="1rem">
                            {booking.status === 0 ? (
                                <>
                                    {type === 'owner' ? (
                                        <>
                                            <Button variant="contained" onClick={() => handleAcceptBooking()}>
                                                Accept booking
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleRejectBooking()}
                                                color="error"
                                            >
                                                Refuse booking
                                            </Button>
                                        </>
                                    ) : (
                                        <Typography>Waiting for approval from owner</Typography>
                                    )}
                                </>
                            ) : booking.status === 1 ? (
                                <>
                                    {type === 'owner' ? (
                                        <Typography>You rejected this booking</Typography>
                                    ) : (
                                        <Typography>The owner rejected this booking</Typography>
                                    )}
                                </>
                            ) : booking.status === 2 ? (
                                <>
                                    {type === 'owner' ? (
                                        <Typography>Waiting for payment</Typography>
                                    ) : (
                                        <Button variant="contained" onClick={() => handlePayBooking()}>
                                            Pay booking
                                        </Button>
                                    )}
                                </>
                            ) : booking.status === 3 ? (
                                <>
                                    {type === 'owner' ? (
                                        <>
                                            {isBookingEnded() ? (
                                                <>
                                                    {booking.validatedOwner ? (
                                                        <Typography>
                                                            Please wait for the recipient to validate the booking
                                                        </Typography>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => handleValidateBookingAsOwner()}
                                                        >
                                                            Validate booking
                                                        </Button>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>{getTimeToEnd(booking.timestampEnd.toNumber())}</Typography>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {isBookingEnded() ? (
                                                <>
                                                    {booking.validatedRecipient ? (
                                                        <Typography>
                                                            Please wait for the owner to validate the booking
                                                        </Typography>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => handleValidateBookingAsRecipient()}
                                                        >
                                                            Validate booking
                                                        </Button>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>{getTimeToEnd(booking.timestampEnd.toNumber())}</Typography>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : booking.status === 4 ? (
                                <>
                                    {type === 'owner' ? (
                                        <Stack>
                                            <Typography>
                                                Amount to get :
                                                <b> {ethers.utils.formatEther(booking.amountLocked)} ETH</b>
                                            </Typography>
                                            {isBookingEnded() ? (
                                                <>
                                                    {booking.amountLocked.toString() !== '0' ? (
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => handleRetrieveAmount()}
                                                        >
                                                            Retrieve amount
                                                        </Button>
                                                    ) : (
                                                        <Typography>Already retrieved</Typography>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>{getTimeToEnd(booking.timestampEnd.toNumber())}</Typography>
                                            )}
                                        </Stack>
                                    ) : (
                                        <Stack>
                                            <Typography>
                                                Amount to get :
                                                <b> {ethers.utils.formatEther(booking.cautionLocked)} ETH</b>
                                            </Typography>
                                            {isBookingEnded() ? (
                                                <>
                                                    {booking.cautionLocked.toString() !== '0' ? (
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => handleRetrieveCaution()}
                                                        >
                                                            Retrieve caution
                                                        </Button>
                                                    ) : (
                                                        <Typography>Already retrieved</Typography>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>{getTimeToEnd(booking.timestampEnd.toNumber())}</Typography>
                                            )}
                                        </Stack>
                                    )}
                                </>
                            ) : (
                                <Typography>This booking is completed</Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                ''
            )}
        </>
    );
}
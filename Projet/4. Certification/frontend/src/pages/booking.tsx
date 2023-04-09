import { useEffect, useState } from 'react';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import CardBooking from '@/components/CardBooking/CardBooking';

import { useNetwork, useAccount } from 'wagmi';
import { useAlertContext, useContractContext } from '@/context';

import { Typography, Container, Box } from '@mui/material';

import IBooking from '../interfaces/Booking';

export default function Booking() {
    const { address } = useAccount();
    const { chain } = useNetwork();

    const { setAlert } = useAlertContext();
    const { readContract } = useContractContext();

    const [bookingOwner, setBookingOwner] = useState<Array<IBooking>>([]);
    const [bookingRecipient, setBookingRecipient] = useState<Array<IBooking>>([]);

    useEffect(() => {
        (async () => {
            try {
                setBookingOwner(await readContract('SmartStayBooking', 'getBookingOwner', [{ from: address }]));
            } catch (e) {
                setAlert({
                    message: 'An error has occurred. Check the developer console for more information',
                    severity: 'error'
                });
                console.error(e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain, address]);

    useEffect(() => {
        (async () => {
            try {
                setBookingRecipient(await readContract('SmartStayBooking', 'getBookingRecipient', [{ from: address }]));
            } catch (e) {
                setAlert({
                    message: 'An error has occurred. Check the developer console for more information',
                    severity: 'error'
                });
                console.error(e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain, address]);

    return (
        <>
            <Head>
                <title>SmartStay: Booking</title>
                <meta name="description" content="SmartStay project for Alyra certification" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                <Box
                    width="100%"
                    height="100%"
                    display="flex"
                    alignItems="center"
                    flexDirection="column"
                    overflow="auto"
                >
                    <Typography variant="h4" textAlign={'center'} m="2rem">
                        Manage bookings
                    </Typography>
                    <Container>
                        <Box flexGrow="1" position="relative">
                            <Typography variant="h5" textAlign={'center'} m="2rem">
                                Booking Owner
                            </Typography>
                            <Box display="flex" justifyContent="space-evenly" flexWrap="wrap">
                                {bookingOwner.length > 0 ? (
                                    <>
                                        {bookingOwner.map((booking: IBooking) => (
                                            <CardBooking
                                                key={booking.id.toString()}
                                                _booking={booking}
                                                type="owner"
                                            ></CardBooking>
                                        ))}
                                    </>
                                ) : (
                                    <Typography>You do not have any booking as owner yet.</Typography>
                                )}
                            </Box>
                        </Box>
                        <Box flexGrow="1" position="relative">
                            <Typography variant="h5" textAlign={'center'} m="2rem">
                                Booking Recipient
                            </Typography>
                            <Box display="flex" justifyContent="space-evenly" flexWrap="wrap">
                                {bookingRecipient.length > 0 ? (
                                    <>
                                        {bookingRecipient.map((booking) => (
                                            <CardBooking
                                                key={booking.id.toString()}
                                                _booking={booking}
                                                type="recipient"
                                            ></CardBooking>
                                        ))}
                                    </>
                                ) : (
                                    <Typography>You do not have any booking as recipient yet.</Typography>
                                )}
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Layout>
        </>
    );
}

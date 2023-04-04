import { useEffect, useState } from 'react';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import CardBooking from '@/components/CardBooking/CardBooking';

import { useNetwork, useAccount } from 'wagmi';
import { useAlertContext, useContractContext } from '@/context';

import { Typography, Box } from '@mui/material';

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
                <Box width="100%" display="flex" alignItems="center" flexDirection="column" overflow="auto">
                    <Box width="80%" flexGrow="1" position="relative">
                        <Typography variant="h4" textAlign={'center'} m="2rem">
                            Booking Owner
                        </Typography>
                        <Box display="flex" justifyContent="space-evenly" flexWrap="wrap">
                            {bookingOwner.map((booking: IBooking) => (
                                <CardBooking key={booking.id.toString()} _booking={booking} type="owner"></CardBooking>
                            ))}
                        </Box>
                    </Box>
                    <Box width="80%" flexGrow="1" position="relative">
                        <Typography variant="h4" textAlign={'center'} m="2rem">
                            Booking Recipient
                        </Typography>
                        <Box display="flex" justifyContent="space-evenly" flexWrap="wrap">
                            {bookingRecipient.map((booking) => (
                                <CardBooking
                                    key={booking.id.toString()}
                                    _booking={booking}
                                    type="recipient"
                                ></CardBooking>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Layout>
        </>
    );
}

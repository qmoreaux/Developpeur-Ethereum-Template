import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import CardBooking from '@/components/CardBooking/CardBooking';

import { ethers } from 'ethers';
import { useNetwork, useProvider, useAccount } from 'wagmi';
import { useAlertContext } from '@/context';

import { Typography, Box } from '@mui/material';

import artifacts from '../../contracts/SmartStay.json';

import IBooking from '../interfaces/Booking';
import INetworks from '../interfaces/Networks';

export default function Booking() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();
    const router = useRouter();

    const { setAlert } = useAlertContext();

    const [bookingOwner, setBookingOwner] = useState<Array<IBooking>>([]);
    const [bookingRecipient, setBookingRecipient] = useState<Array<IBooking>>([]);

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract(
                        (artifacts.networks as INetworks)[chain.id].address,
                        artifacts.abi,
                        provider
                    );
                    setBookingOwner(await contract.getBookingOwner({ from: address }));
                } catch (e) {
                    setAlert({
                        message: 'An error has occurred. Check the developer console for more information',
                        severity: 'error'
                    });
                    console.error(e);
                }
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, chain, address]);

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract(
                        (artifacts.networks as INetworks)[chain.id].address,
                        artifacts.abi,
                        provider
                    );
                    setBookingRecipient(await contract.getBookingRecipient({ from: address }));
                } catch (e) {
                    setAlert({
                        message: 'An error has occurred. Check the developer console for more information',
                        severity: 'error'
                    });
                    console.error(e);
                }
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, chain, address]);

    useEffect(() => {
        if (!isConnected) {
            router.push('/');
        }
    }, [isConnected, router]);

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

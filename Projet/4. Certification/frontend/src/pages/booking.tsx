import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Head from "next/head";
import Layout from "@/components/Layout/Layout";
import CardBooking from "@/components/CardBooking/CardBooking";

import { ethers } from "ethers";
import { useNetwork, useProvider, useAccount } from "wagmi";
import { Typography, Box } from "@mui/material";

import { networks, abi } from "../../contracts/SmartStay.json";

import IBooking from "../interfaces/Booking";
import INetworks from "../interfaces/Networks";

export default function Booking() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();
    const router = useRouter();

    const [bookingOwner, setBookingOwner] = useState<Array<IBooking>>([]);
    const [bookingRecipient, setBookingRecipient] = useState<Array<IBooking>>([]);

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, provider);
                    setBookingOwner(await contract.getBookingOwner({ from: address }));
                } catch (e) {
                    console.error(e);
                }
            }
        })();
    }, [address]);

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, provider);
                    setBookingRecipient(await contract.getBookingRecipient({ from: address }));
                } catch (e) {
                    console.error(e);
                }
            }
        })();
    }, [address]);

    useEffect(() => {
        if (!isConnected) {
            router.push("/");
        }
    }, []);

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
                        <Typography variant="h4" textAlign={"center"} m="2rem">
                            Booking Owner
                        </Typography>
                        <Box display="flex" justifyContent="space-evenly" flexWrap="wrap">
                            {bookingOwner.map((booking: IBooking) => (
                                <CardBooking key={booking.id.toString()} _booking={booking} type="owner"></CardBooking>
                            ))}
                        </Box>
                    </Box>
                    <Box width="80%" flexGrow="1" position="relative">
                        <Typography variant="h4" textAlign={"center"} m="2rem">
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

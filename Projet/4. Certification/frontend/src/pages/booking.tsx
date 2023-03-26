import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Head from "next/head";
import Layout from "@/components/Layout/Layout";

import { ethers } from "ethers";
import { useNetwork, useProvider, useAccount } from "wagmi";
import { Button, Typography, Box, Card, CardContent } from "@mui/material";

import { networks, abi } from "../../contracts/SmartStay.json";

import Booking from "../interfaces/Booking";
import Networks from "../interfaces/Networks";

export default function Renter() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();
    const router = useRouter();

    const [bookingOwner, setBookingOwner] = useState<Array<Booking>>([]);
    const [bookingRecipient, setBookingRecipient] = useState<Array<Booking>>([]);

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, provider);
                    setBookingOwner(await contract.getBookingOwner({ from: address }));
                    console.log(await contract.getBookingOwner({ from: address }));
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
                    const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, provider);
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
                <Box width="80%" flexGrow="1" position="relative">
                    <Typography variant="h4" textAlign={"center"} m="2rem">
                        Booking Owner
                    </Typography>
                    <Box display="flex" justifyContent={"space-evenly"}>
                        {bookingOwner.map((booking: Booking) => (
                            <Card
                                key={booking.id.toNumber()}
                                sx={{
                                    backgroundColor: "whitesmoke",
                                    width: "400px",
                                    boxShadow: "0 0 4px rgba(0, 0, 0, 0.3)"
                                }}
                            >
                                <CardContent>
                                    <Typography>Booking ID : #{booking.id.toNumber()}</Typography>
                                    <Typography>
                                        {" "}
                                        Start date : {new Date(booking.timestampStart * 1000).toLocaleDateString()}
                                    </Typography>
                                    <Typography>Person count: {booking.personCount}</Typography>
                                    <Typography>Duration : {booking.duration}</Typography>
                                    <Box display="flex" justifyContent="space-between" mt="1rem"></Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>
                <Box width="80%" flexGrow="1" position="relative">
                    <Typography variant="h4" textAlign={"center"} m="2rem">
                        Booking Recipient
                    </Typography>
                    <Box display="flex" justifyContent={"space-evenly"}>
                        {bookingRecipient.map((booking) => (
                            <Card
                                key={booking.id.toNumber()}
                                sx={{
                                    backgroundColor: "whitesmoke",
                                    width: "400px",
                                    boxShadow: "0 0 4px rgba(0, 0, 0, 0.3)"
                                }}
                            >
                                <CardContent>
                                    <Typography>Booking ID : #{booking.id.toNumber()}</Typography>
                                    <Typography>
                                        Start date : {new Date(booking.timestampStart * 1000).toLocaleDateString()}
                                    </Typography>
                                    <Typography>Person count: {booking.personCount}</Typography>
                                    <Typography>Duration : {booking.duration}</Typography>
                                    <Box display="flex" justifyContent="space-between" mt="1rem"></Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>
            </Layout>
        </>
    );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Head from "next/head";
import Layout from "@/components/Layout/Layout";

import { ethers } from "ethers";
import { useNetwork, useProvider, useSigner, useAccount } from "wagmi";
import { Button, Typography, Box, Card, CardContent } from "@mui/material";

import { networks, abi } from "../../contracts/SmartStay.json";

import Booking from "../interfaces/Booking";
import Networks from "../interfaces/Networks";

export default function Renter() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();
    const { data: signer } = useSigner();
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
                    console.log(await contract.getBookingRecipient({ from: address }));
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

    const getRenting = async (bookingID: number) => {
        if (provider && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, provider);
                const renting = await contract.getRentingFromBookingID(bookingID);
                return renting;
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleAcceptBooking = async (bookingID: number) => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, signer);
                const transaction = await contract.approveBooking(bookingID);
                await transaction.wait();
                setBookingOwner(
                    bookingOwner.map((booking: Booking) => {
                        if (booking.id.toNumber() === bookingID) {
                            booking = {
                                ...booking,
                                status: 2
                            };
                        }
                        return booking;
                    })
                );
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleRejectBooking = async (bookingID: number) => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, signer);
                const transaction = await contract.rejectBooking(bookingID);
                await transaction.wait();
                const bookingsUpdated = bookingOwner.map((booking) => {
                    if (booking.id.toNumber() === bookingID) {
                        booking.status = 1;
                    }
                    return booking;
                });
                setBookingOwner(bookingsUpdated);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handlePayBooking = async (booking: Booking) => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, signer);
                let renting = await getRenting(booking.id.toNumber());
                const transaction = await contract.confirmBooking(booking.id.toNumber(), {
                    value: ethers.utils.parseUnits(
                        renting.unitPrice * booking.duration + renting.caution.toString(),
                        "ether"
                    )
                });
                await transaction.wait();
                setBookingRecipient(
                    bookingRecipient.map((_booking: Booking) => {
                        if (_booking.id.toNumber() === booking.id.toNumber()) {
                            _booking = {
                                ..._booking,
                                status: 3
                            };
                        }
                        return _booking;
                    })
                );
            } catch (e) {
                console.error(e);
            }
        }
    };

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
                            {bookingOwner.map((booking: Booking) => (
                                <Card
                                    key={booking.id.toNumber()}
                                    sx={{
                                        backgroundColor: "whitesmoke",
                                        width: "400px",
                                        boxShadow: "0 0 4px rgba(0, 0, 0, 0.3)",
                                        marginBottom: "1rem"
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
                                        <Box display="flex" justifyContent="space-between" mt="1rem">
                                            {booking.status === 0 ? (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => {
                                                            handleAcceptBooking(booking.id.toNumber());
                                                        }}
                                                    >
                                                        Accept booking
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => {
                                                            handleRejectBooking(booking.id.toNumber());
                                                        }}
                                                        color="error"
                                                    >
                                                        Refuse booking
                                                    </Button>
                                                </>
                                            ) : booking.status === 1 ? (
                                                <Typography>You rejected this booking</Typography>
                                            ) : booking.status === 2 ? (
                                                <Typography>Waiting for payment</Typography>
                                            ) : booking.status === 3 ? (
                                                <>
                                                    {booking.timestampEnd < new Date().getTime() ? (
                                                        <>
                                                            <Typography>
                                                                Amount to receive at the end of the booking :{" "}
                                                                <b>{booking.amountPayed.toNumber()}</b>
                                                            </Typography>
                                                            <Typography>Show time to end</Typography>
                                                        </>
                                                    ) : (
                                                        <Button variant="contained">Retrieve money</Button>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>This booking is completed</Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                    <Box width="80%" flexGrow="1" position="relative">
                        <Typography variant="h4" textAlign={"center"} m="2rem">
                            Booking Recipient
                        </Typography>
                        <Box display="flex" justifyContent="space-evenly" flexWrap="wrap">
                            {bookingRecipient.map((booking) => (
                                <Card
                                    key={booking.id.toNumber()}
                                    sx={{
                                        backgroundColor: "whitesmoke",
                                        width: "400px",
                                        boxShadow: "0 0 4px rgba(0, 0, 0, 0.3)",
                                        marginBottom: "1rem"
                                    }}
                                >
                                    <CardContent>
                                        <Typography>Booking ID : #{booking.id.toNumber()}</Typography>
                                        <Typography>
                                            Start date : {new Date(booking.timestampStart * 1000).toLocaleDateString()}
                                        </Typography>
                                        <Typography>Person count: {booking.personCount}</Typography>
                                        <Typography>Duration : {booking.duration}</Typography>
                                        <Box display="flex" justifyContent="space-between" mt="1rem">
                                            {booking.status === 0 ? (
                                                <Typography>Waiting for approval from owner</Typography>
                                            ) : booking.status === 1 ? (
                                                <Typography>The owner rejected this booking</Typography>
                                            ) : booking.status === 2 ? (
                                                <Button variant="contained" onClick={() => handlePayBooking(booking)}>
                                                    Pay booking
                                                </Button>
                                            ) : booking.status === 3 ? (
                                                <>
                                                    {booking.timestampEnd < new Date().getTime() ? (
                                                        <Typography>Show time to end</Typography>
                                                    ) : (
                                                        <Button variant="contained">Retrieve caution</Button>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>This booking is completed</Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Layout>
        </>
    );
}

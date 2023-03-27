import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Head from "next/head";
import Layout from "@/components/Layout/Layout";

import { ethers, BigNumber } from "ethers";
import { useNetwork, useProvider, useSigner, useAccount } from "wagmi";
import { Button, Typography, Box, Card, CardContent, Stack } from "@mui/material";

import { networks, abi } from "../../contracts/SmartStay.json";

import IBooking from "../interfaces/Booking";
import INetworks from "../interfaces/Networks";

export default function Booking() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();
    const { data: signer } = useSigner();
    const router = useRouter();

    const [bookingOwner, setBookingOwner] = useState<Array<IBooking>>([]);
    const [bookingRecipient, setBookingRecipient] = useState<Array<IBooking>>([]);

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, provider);
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
                    const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, provider);
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
                const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, provider);
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
                const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, signer);
                const transaction = await contract.approveBooking(bookingID);
                await transaction.wait();
                setBookingOwner(
                    bookingOwner.map((booking: IBooking) => {
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
                const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, signer);
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

    const handlePayBooking = async (booking: IBooking) => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, signer);
                let renting = await getRenting(booking.id.toNumber());
                const transaction = await contract.confirmBooking(booking.id.toNumber(), {
                    value: ethers.utils.parseUnits(
                        (renting.unitPrice * booking.duration + renting.caution).toString(),
                        "ether"
                    )
                });
                await transaction.wait();
                setBookingRecipient(
                    bookingRecipient.map((_booking: IBooking) => {
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

    const handleRetrieveCaution = async (booking: IBooking) => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, signer);
                const transaction = await contract.retrieveCaution(booking.id.toNumber());
                await transaction.wait();
                setBookingRecipient(
                    bookingRecipient.map((_booking: IBooking) => {
                        if (_booking.id.toNumber() === booking.id.toNumber()) {
                            _booking = {
                                ..._booking,
                                cautionLocked: BigNumber.from(0),
                                status: booking.amountLocked.toNumber() === 0 ? 4 : 3
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

    const handleRetrieveAmount = async (booking: IBooking) => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, signer);
                const transaction = await contract.retrieveAmount(booking.id.toNumber());
                await transaction.wait();
                setBookingRecipient(
                    bookingRecipient.map((_booking: IBooking) => {
                        if (_booking.id.toNumber() === booking.id.toNumber()) {
                            _booking = {
                                ..._booking,
                                amountLocked: BigNumber.from(0),
                                status: booking.cautionLocked.toNumber() === 0 ? 4 : 3
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

    const getTimeToEnd = (timestampEnd: number) => {
        const data = {
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
        const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
        const DAYS_IN_SECONDS = 60 * 60 * 24;
        const HOURS_IN_SECONDS = 60 * 60;
        const MINUTES_IN_SECONDS = 60;
        let timeToEnd: number = Math.trunc(timestampEnd - new Date().getTime() / 1000);
        console.log(timeToEnd);
        data.weeks = Math.trunc(timeToEnd / WEEK_IN_SECONDS);
        timeToEnd %= WEEK_IN_SECONDS;
        data.days = Math.trunc(timeToEnd / DAYS_IN_SECONDS);
        timeToEnd %= DAYS_IN_SECONDS;
        data.hours = Math.trunc(timeToEnd / HOURS_IN_SECONDS);
        timeToEnd %= HOURS_IN_SECONDS;
        data.minutes = Math.trunc(timeToEnd / MINUTES_IN_SECONDS);
        timeToEnd %= MINUTES_IN_SECONDS;
        data.seconds = timeToEnd;

        return `Reservation ends in : ${data.weeks ? data.weeks + "weeks, " : ""}${
            data.days ? data.days + "days, " : ""
        }${data.hours ? data.hours + "hours, " : ""}${data.minutes ? data.minutes + "minutes, " : ""}${
            data.seconds ? data.seconds + "seconds, " : ""
        }`;
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
                            {bookingOwner.map((booking: IBooking) => (
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
                                                <Stack>
                                                    <Typography>
                                                        Amount to get :
                                                        <b> {ethers.utils.formatEther(booking.amountLocked)} ETH</b>
                                                    </Typography>
                                                    {new Date().getTime() / 1000 < booking.timestampEnd ? (
                                                        <Typography>{getTimeToEnd(booking.timestampEnd)}</Typography>
                                                    ) : (
                                                        <>
                                                            {ethers.utils.formatEther(booking.amountLocked) != "0.0" ? (
                                                                <Button
                                                                    variant="contained"
                                                                    onClick={() => handleRetrieveAmount(booking)}
                                                                >
                                                                    Retrieve amount
                                                                </Button>
                                                            ) : (
                                                                <Typography>Already retrieved</Typography>
                                                            )}
                                                        </>
                                                    )}
                                                </Stack>
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
                                                <Stack>
                                                    <Typography>
                                                        Amount to get :
                                                        <b> {ethers.utils.formatEther(booking.cautionLocked)} ETH</b>
                                                    </Typography>
                                                    {new Date().getTime() / 1000 < booking.timestampEnd ? (
                                                        <Typography>{getTimeToEnd(booking.timestampEnd)}</Typography>
                                                    ) : (
                                                        <>
                                                            {ethers.utils.formatEther(booking.cautionLocked) !=
                                                            "0.0" ? (
                                                                <Button
                                                                    variant="contained"
                                                                    onClick={() => handleRetrieveCaution(booking)}
                                                                >
                                                                    Retrieve caution
                                                                </Button>
                                                            ) : (
                                                                <Typography>Already retrieved</Typography>
                                                            )}
                                                        </>
                                                    )}
                                                </Stack>
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

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import BookRentingDialog from '@/dialogs/BookRenting';

import { useNetwork, useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useAlertContext, useContractContext } from '@/context';

import {
    Button,
    Typography,
    Box,
    Card,
    CardContent,
    CardMedia,
    Grid,
    TextField,
    InputAdornment,
    Autocomplete
} from '@mui/material';
import { BookOnline, Person, AttachMoney, LocationCity } from '@mui/icons-material';

import IRenting from '../interfaces/Renting';
import CreateDIDDialog from '@/dialogs/CreateDID';

export default function Renting() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();

    const router = useRouter();

    const { setAlert } = useAlertContext();
    const { readContract } = useContractContext();

    const [rentings, setRentings] = useState<Array<IRenting>>([]);
    const [maxUnitPrice, setMaxUnitPrice] = useState<number>(0);
    const [personCount, setPersonCount] = useState<number>(0);
    const [location, setLocation] = useState<string>('');
    const [tags, setTags] = useState<Array<string>>([]);
    const [availableTags, setAvailableTags] = useState<Array<string>>([]);

    const [openBooking, setOpenBooking] = useState(false);
    const [openCreateDID, setOpenCreateDID] = useState(false);

    const [bookingRenting, setBookingRenting] = useState({} as IRenting);

    const [isDIDValid, setIsDIDValid] = useState(false);

    const handleStartBooking = (data: IRenting) => {
        if (!isDIDValid) {
            setOpenCreateDID(true);
            return;
        }
        setOpenBooking(true);
        setBookingRenting(data);
    };

    const handleCloseCreateDID = (data: boolean) => {
        setOpenCreateDID(false);
        if (data) {
            setIsDIDValid(true);
        }
    };

    const handleCloseBooking = (data: boolean) => {
        setOpenBooking(false);
        setBookingRenting({} as IRenting);

        if (data) {
            router.push('/booking');
        }
    };

    const handleTagsChange = (newValue: Array<string>) => {
        setTags(newValue);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key == 'Enter') {
            searchRentings();
        }
    };
    const searchRentings = useCallback(async () => {
        try {
            setRentings(
                await readContract('SmartStayRenting', 'searchRenting', [
                    ethers.utils.parseUnits(maxUnitPrice.toString(), 'ether'),
                    personCount,
                    location,
                    tags,
                    { from: address }
                ])
            );
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain, address, location, maxUnitPrice, personCount, tags]);

    useEffect(() => {
        setAvailableTags(['Maison', 'Appartement', 'Piscine', 'Montagne', 'Bord de mer']);
    }, []);

    useEffect(() => {
        searchRentings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain, address]);

    useEffect(() => {
        (async () => {
            if (isConnected) {
                try {
                    const DID = await readContract('SmartStayBooking', 'getUserDID', [address, { from: address }]);
                    setIsDIDValid(DID.tokenID.toNumber());
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
    }, [chain, address, isConnected]);

    return (
        <>
            <Head>
                <title>SmartStay: Renting</title>
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
                    <Box width="80%" flexGrow="1">
                        <Typography variant="h4" textAlign={'center'} m="2rem">
                            Available bookings
                        </Typography>
                        <Box>
                            <Grid container justifyContent="space-between" mb="2rem">
                                <Grid item>
                                    <TextField
                                        label="Maximum night price (ETH)"
                                        variant="standard"
                                        type="number"
                                        InputProps={{
                                            inputProps: {
                                                min: 0
                                            },
                                            endAdornment: (
                                                <InputAdornment position="start">
                                                    <AttachMoney />
                                                </InputAdornment>
                                            )
                                        }}
                                        onChange={(event) => {
                                            setMaxUnitPrice(+event.target.value);
                                        }}
                                        onKeyDown={handleKeyPress}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        label="Persons"
                                        variant="standard"
                                        type="number"
                                        InputProps={{
                                            inputProps: {
                                                min: 0
                                            },
                                            endAdornment: (
                                                <InputAdornment position="start">
                                                    <Person />
                                                </InputAdornment>
                                            )
                                        }}
                                        onChange={(event) => {
                                            setPersonCount(+event.target.value);
                                        }}
                                        onKeyDown={handleKeyPress}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        label="Location"
                                        variant="standard"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="start">
                                                    <LocationCity />
                                                </InputAdornment>
                                            )
                                        }}
                                        onChange={(event) => {
                                            setLocation(event.target.value);
                                        }}
                                        onKeyDown={handleKeyPress}
                                    />
                                </Grid>
                                <Grid item sx={{ width: 300 }}>
                                    <Autocomplete
                                        multiple
                                        limitTags={2}
                                        options={availableTags}
                                        onChange={(event: React.SyntheticEvent, newValue: Array<string>) => {
                                            handleTagsChange(newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} variant="standard" label="Tags" />
                                        )}
                                        onKeyDown={handleKeyPress}
                                    />
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" onClick={searchRentings}>
                                        Search
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box display="flex" justifyContent="space-evenly" flexWrap="wrap" flexGrow="1">
                            {rentings.map((renting: IRenting) => (
                                <Card
                                    key={renting.id.toNumber()}
                                    sx={{
                                        backgroundColor: 'whitesmoke',
                                        width: '400px',
                                        boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                                        marginBottom: '2rem'
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200px"
                                        image={renting.imageURL}
                                        alt="Image rental"
                                        sx={{ backgroundColor: 'white', objectFit: 'contain' }}
                                    ></CardMedia>
                                    <CardContent>
                                        <Typography>Renting ID : #{renting.id.toString()}</Typography>
                                        <Typography>
                                            Night price : {ethers.utils.formatEther(renting.unitPrice)} ETH
                                        </Typography>
                                        <Typography>
                                            Deposit : {ethers.utils.formatEther(renting.deposit)} ETH
                                        </Typography>
                                        <Typography>Maximum persons: {renting.personCount.toString()}</Typography>
                                        <Typography>Location : {renting.location}</Typography>
                                        <Typography>Tags : {renting.tags.join(', ')}</Typography>
                                        <Typography>Description : {renting.description}</Typography>
                                        {isConnected ? (
                                            <>
                                                <Typography
                                                    onClick={() => {
                                                        router.push('/profile?addr=' + renting.owner);
                                                    }}
                                                    sx={{
                                                        textDecoration: 'underline',
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        color: '#1976d2',
                                                        marginTop: '1rem'
                                                    }}
                                                >
                                                    View owner profile
                                                </Typography>
                                                <Box display="flex" justifyContent="space-between" mt="1rem">
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => handleStartBooking(renting)}
                                                        startIcon={<BookOnline />}
                                                    >
                                                        <Typography>Book</Typography>
                                                    </Button>
                                                </Box>
                                            </>
                                        ) : (
                                            ''
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {rentings.length == 0 ? (
                                <Typography textAlign="center">No bookings matches these filters.</Typography>
                            ) : (
                                ''
                            )}
                        </Box>
                    </Box>
                </Box>
                <CreateDIDDialog
                    open={openCreateDID}
                    renter={false}
                    onClose={(status: boolean) => handleCloseCreateDID(status)}
                />
                <BookRentingDialog
                    open={openBooking}
                    _renting={bookingRenting}
                    onClose={(status: boolean) => handleCloseBooking(status)}
                />
            </Layout>
        </>
    );
}

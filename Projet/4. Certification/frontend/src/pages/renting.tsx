import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import BookRentingDialog from '@/dialogs/BookRenting';

import { useNetwork, useProvider, useAccount } from 'wagmi';
import { ethers } from 'ethers';
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
import { BookOnline, Person, AttachMoney, LocationCity, Filter } from '@mui/icons-material';

import artifacts from '../../contracts/SmartStay.json';

import IRenting from '../interfaces/Renting';
import INetworks from '../interfaces/Networks';

export default function Renting() {
    const { address, isConnected } = useAccount();

    const { chain } = useNetwork();
    const provider = useProvider();
    const router = useRouter();

    const [rentings, setRentings] = useState<Array<IRenting>>([]);
    const [maxUnitPrice, setMaxUnitPrice] = useState<number>(0);
    const [personCount, setPersonCount] = useState<number>(0);
    const [location, setLocation] = useState<string>('');
    const [tags, setTags] = useState<Array<string>>([]);
    const [availableTags, setAvailableTags] = useState<Array<string>>([]);

    const [openBooking, setOpenBooking] = useState(false);
    const [bookingRentingID, setBookingRentingID] = useState(0);

    const handleStartBooking = (data?: any) => {
        setOpenBooking(true);
        setBookingRentingID(data);
    };

    const handleCloseBooking = (data: any) => {
        setOpenBooking(false);
        setBookingRentingID(0);

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
        if (provider && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    provider
                );
                setRentings(
                    await contract.searchRenting(
                        ethers.utils.parseUnits(maxUnitPrice.toString(), 'ether'),
                        personCount,
                        location,
                        tags,
                        { from: address }
                    )
                );
            } catch (e) {
                console.error(e);
            }
        }
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
                    setAvailableTags(await contract.getTags());
                } catch (e) {
                    console.error(e);
                }
            }
        })();
    }, [provider, chain]);

    useEffect(() => {
        searchRentings();
    }, [address, searchRentings]);

    useEffect(() => {
        if (!isConnected) {
            router.push('/');
        }
    }, [isConnected, router]);

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
                                        onChange={(event: any, newValue: Array<string>) => {
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
                                            Caution : {ethers.utils.formatEther(renting.caution)} ETH
                                        </Typography>
                                        <Typography>Maximum persons: {renting.personCount.toString()}</Typography>
                                        <Typography>Location : {renting.location}</Typography>
                                        <Typography>Tags : {renting.tags.join(', ')}</Typography>
                                        <Typography>Description : {renting.description}</Typography>
                                        <Box display="flex" justifyContent="space-between" mt="1rem">
                                            <Button
                                                variant="contained"
                                                onClick={() => handleStartBooking(renting.id.toNumber())}
                                                startIcon={<BookOnline />}
                                            >
                                                <Typography>Book</Typography>
                                            </Button>
                                        </Box>
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
                <BookRentingDialog
                    open={openBooking}
                    _rentingID={bookingRentingID}
                    onClose={(status: boolean) => handleCloseBooking(status)}
                />
            </Layout>
        </>
    );
}

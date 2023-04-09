import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { ethers } from 'ethers';

import Axios from 'axios';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';

import { useAlertContext, useContractContext } from '@/context';

import { useNetwork, useAccount } from 'wagmi';
import { Container, Typography, Box, Card, Grid, CardContent, CardMedia } from '@mui/material';

import INFTItem from '../interfaces/NFTItem';
import ISBTItem from '../interfaces/SBTItem';
import IDIDItem from '../interfaces/DIDItem';

import IRating from '../interfaces/Rating';

export default function Profile() {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const router = useRouter();

    const { setAlert } = useAlertContext();
    const { readContract } = useContractContext();

    const [addressToUse, setAddressToUse] = useState<any>('');
    const [ownProfile, setOwnProfile] = useState(false);

    const [NFTCollection, setNFTCollection] = useState<INFTItem[]>([]);
    const [SBTCollection, setSBTCollection] = useState<ISBTItem[]>([]);
    const [DIDItem, setDIDItem] = useState<IDIDItem>({} as IDIDItem);

    const [NFTCollectionAddress, setNFTCollectionAddress] = useState<string>('');
    const [SBTCollectionAddress, setSBTCollectionAddress] = useState<string>('');
    const [DIDCollectionAddress, setDIDCollectionAddress] = useState<string>('');

    const [ratingsAsOwner, setRatingsAsOwner] = useState<IRating[]>([]);
    const [ratingsAsRecipient, setRatingsAsRecipient] = useState<IRating[]>([]);

    useEffect(() => {
        setAddressToUse(router.query.addr ? router.query.addr : address);
        setOwnProfile(router.query.addr ? false : true);
    }, [router.query.addr, address]);

    useEffect(() => {
        if (addressToUse) {
            getCollectionAddress();
            getRatings();
            getUserDID();
            getUserNFT();
            getUserSBT();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain, address, addressToUse]);

    const getCollectionAddress = async () => {
        setNFTCollectionAddress(await readContract('SmartStayBooking', 'getNFTCollection', [{ from: address }]));
        setSBTCollectionAddress(await readContract('SmartStayBooking', 'getSBTCollection', [{ from: address }]));
        setDIDCollectionAddress(await readContract('SmartStayBooking', 'getDIDCollection', [{ from: address }]));
    };

    const getRatings = async () => {
        const ratings = await readContract('SmartStayBooking', 'getRating', [addressToUse, { from: address }]);
        setRatingsAsOwner(ratings.filter((rating: IRating) => rating.owner));
        setRatingsAsRecipient(ratings.filter((rating: IRating) => !rating.owner));
    };

    const getAverageRatingAsOwner = () => {
        const totalNote = ratingsAsOwner.reduce((acc: number, current: IRating) => acc + current.note, 0);
        return Math.round((totalNote / ratingsAsOwner.length) * 100) / 100;
    };

    const getAverageRatingAsRecipient = () => {
        const totalNote = ratingsAsRecipient.reduce((acc: number, current: IRating) => acc + current.note, 0);
        return Math.round((totalNote / ratingsAsRecipient.length) * 100) / 100;
    };

    const getUserNFT = async () => {
        try {
            const NFTtransaction = await readContract('SmartStayBooking', 'getUserNFT', [
                addressToUse,
                { from: address }
            ]);
            setNFTCollection(
                await Promise.all<INFTItem[]>(
                    NFTtransaction.map(async (NFTItem: INFTItem) => {
                        let meta = await Axios.get(NFTItem.tokenURI);
                        meta = meta.data;
                        return {
                            ...meta,
                            tokenID: NFTItem.tokenID
                        };
                    })
                )
            );
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
    };

    const getUserSBT = async () => {
        try {
            const SBTtransaction = await readContract('SmartStayBooking', 'getUserSBT', [
                addressToUse,
                { from: address }
            ]);
            setSBTCollection(
                await Promise.all<ISBTItem[]>(
                    SBTtransaction.map(async (NFTItem: ISBTItem) => {
                        let meta = await Axios.get(NFTItem.tokenURI);
                        meta = meta.data;
                        return {
                            ...NFTItem,
                            ...meta
                        };
                    })
                )
            );
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
    };

    const getUserDID = async () => {
        try {
            setDIDItem(await readContract('SmartStayBooking', 'getUserDID', [addressToUse, { from: address }]));
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
    };

    return (
        <>
            <Head>
                <title>SmartStay: Profile</title>
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
                        {ownProfile ? 'My profile' : `Profile of ${addressToUse}`}
                    </Typography>
                    <Container>
                        <Typography variant="h5" mb={'2rem'}>
                            Ratings
                        </Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            <Grid container>
                                <Grid item display={'flex'} flexGrow={1} flexDirection={'column'} alignItems={'center'}>
                                    <Typography variant="h6">As Owner</Typography>
                                    {ratingsAsOwner.length ? (
                                        <>
                                            <Typography sx={{ marginBottom: '1rem' }}>
                                                Average rating :{' '}
                                                <b>
                                                    {getAverageRatingAsOwner()} ({ratingsAsOwner.length} ratings)
                                                </b>
                                            </Typography>
                                            {ratingsAsOwner.map((rating) => (
                                                <Card
                                                    key={rating.id.toNumber()}
                                                    sx={{
                                                        backgroundColor: 'whitesmoke',
                                                        width: '500px',
                                                        boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                                                        marginBottom: '2rem'
                                                    }}
                                                >
                                                    <CardContent sx={{ textAlign: 'left' }}>
                                                        <Typography>
                                                            Rating #<b>{rating.id.toNumber()}</b>
                                                        </Typography>
                                                        <Typography>
                                                            From : <b>{rating.from}</b>
                                                        </Typography>
                                                        <Typography>
                                                            Note : <b>{rating.note}</b>
                                                        </Typography>
                                                        <Typography>
                                                            Comment : <b>{rating.comment}</b>
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {ownProfile ? (
                                                <Typography mb={'2rem'}>
                                                    You do not have any rating as owner yet
                                                </Typography>
                                            ) : (
                                                <Typography mb={'2rem'}>
                                                    This user do not have any rating as owner yet
                                                </Typography>
                                            )}
                                        </>
                                    )}
                                </Grid>
                                <Grid item display={'flex'} flexGrow={1} flexDirection={'column'} alignItems={'center'}>
                                    <Typography variant="h6">As Recipient</Typography>
                                    {ratingsAsRecipient.length ? (
                                        <>
                                            <Typography sx={{ marginBottom: '1rem' }}>
                                                Average rating :{' '}
                                                <b>
                                                    {getAverageRatingAsRecipient()} ({ratingsAsRecipient.length}{' '}
                                                    ratings)
                                                </b>
                                            </Typography>

                                            {ratingsAsRecipient.map((rating) => (
                                                <Card
                                                    key={rating.id.toNumber()}
                                                    sx={{
                                                        backgroundColor: 'whitesmoke',
                                                        width: '500px',
                                                        boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                                                        marginBottom: '2rem'
                                                    }}
                                                >
                                                    <CardContent sx={{ textAlign: 'left' }}>
                                                        <Typography>
                                                            Rating #<b>{rating.id.toNumber()}</b>
                                                        </Typography>
                                                        <Typography>
                                                            From : <b>{rating.from}</b>
                                                        </Typography>
                                                        <Typography>
                                                            Note : <b>{rating.note}</b>
                                                        </Typography>
                                                        <Typography>
                                                            Comment : <b>{rating.comment}</b>
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {ownProfile ? (
                                                <Typography mb={'2rem'}>
                                                    You do not have any rating as recipient yet
                                                </Typography>
                                            ) : (
                                                <Typography mb={'2rem'}>
                                                    This user do not have any rating as recipient yet
                                                </Typography>
                                            )}
                                        </>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    </Container>
                    <Container>
                        <Box display={'flex'} alignItems={'center'} mb={'2rem'}>
                            <Typography variant="h6">Decentralized Identity</Typography>
                            <Typography variant="body2" ml={'1rem'}>
                                ({DIDCollectionAddress})
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {DIDItem.tokenID && DIDItem.tokenID.toNumber() ? (
                                <Card
                                    sx={{
                                        backgroundColor: 'whitesmoke',
                                        boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                                        marginBottom: '2rem'
                                    }}
                                >
                                    <CardContent>
                                        <Typography>
                                            Name :{' '}
                                            <b>
                                                {DIDItem.firstname} {DIDItem.lastname.toUpperCase()}
                                            </b>
                                        </Typography>
                                        <Typography>
                                            Email : <b>{DIDItem.email}</b>
                                        </Typography>
                                        {DIDItem.registeringNumber.toNumber() ? (
                                            <Typography>
                                                Registering number : <b>{DIDItem.registeringNumber.toNumber()}</b>
                                            </Typography>
                                        ) : (
                                            ''
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {ownProfile ? (
                                        <Typography textAlign={'center'} mb={'2rem'}>
                                            You have not created your DID yet.
                                            <br /> Please create a renting or a booking to create it.
                                        </Typography>
                                    ) : (
                                        <Typography textAlign={'center'} mb={'2rem'}>
                                            This user did not create his DID yet
                                        </Typography>
                                    )}
                                </>
                            )}
                        </Box>
                    </Container>
                    <Container>
                        <Box display={'flex'} alignItems={'center'} mb={'2rem'}>
                            <Typography variant="h6">SmartStay Collection</Typography>
                            <Typography variant="body2" ml={'1rem'}>
                                ({NFTCollectionAddress})
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {NFTCollection.length ? (
                                <>
                                    {NFTCollection.map((NFTItem: INFTItem) => (
                                        <Card
                                            key={NFTItem.tokenID.toString()}
                                            sx={{
                                                backgroundColor: 'whitesmoke',
                                                width: '500px',
                                                boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                                                marginBottom: '2rem'
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="200px"
                                                image={NFTItem.image}
                                                alt="Image rental"
                                                sx={{
                                                    backgroundColor: 'white',
                                                    objectFit: 'contain'
                                                }}
                                            ></CardMedia>
                                            <CardContent>
                                                <Typography>NFT ID : #{NFTItem.tokenID.toString()}</Typography>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {ownProfile ? (
                                        <Typography textAlign={'center'} mb={'2rem'}>
                                            You do not have any NFT yet.
                                            <br /> Redeem it after a booking to display it here.
                                        </Typography>
                                    ) : (
                                        <Typography textAlign={'center'} mb={'2rem'}>
                                            This user did not redeem any NFT yet.
                                        </Typography>
                                    )}
                                </>
                            )}
                        </Box>
                    </Container>
                    <Container>
                        <Box display={'flex'} alignItems={'center'} mb={'2rem'}>
                            <Typography variant="h6">SmartStay Receipts</Typography>
                            <Typography variant="body2" ml={'1rem'}>
                                ({SBTCollectionAddress})
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {SBTCollection.length ? (
                                <>
                                    {SBTCollection.map((SBTItem: ISBTItem) => (
                                        <>
                                            <Card
                                                key={SBTItem.tokenID.toString()}
                                                sx={{
                                                    backgroundColor: 'whitesmoke',
                                                    width: '500px',
                                                    boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                                                    marginBottom: '2rem'
                                                }}
                                            >
                                                <CardMedia
                                                    component="img"
                                                    height="200px"
                                                    image={SBTItem.image}
                                                    alt="Image rental"
                                                    sx={{
                                                        backgroundColor: 'white',
                                                        objectFit: 'contain'
                                                    }}
                                                ></CardMedia>
                                                <CardContent>
                                                    <Typography>SBT ID : #{SBTItem.tokenID.toString()}</Typography>
                                                    <Typography>
                                                        Booking ID : #{SBTItem.bookingID.toString()}
                                                    </Typography>
                                                    <Typography>
                                                        Duration: {SBTItem.duration.toString()} days
                                                    </Typography>
                                                    <Typography>
                                                        Price: {ethers.utils.formatEther(SBTItem.price)} ETH
                                                    </Typography>

                                                    {SBTItem.location ? (
                                                        <Typography>Location : {SBTItem.location}</Typography>
                                                    ) : (
                                                        ''
                                                    )}
                                                    {SBTItem.owner !== ethers.constants.AddressZero ? (
                                                        <Typography>Owner : {SBTItem.owner}</Typography>
                                                    ) : (
                                                        ''
                                                    )}

                                                    <Typography></Typography>
                                                </CardContent>
                                            </Card>
                                        </>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {ownProfile ? (
                                        <Typography textAlign={'center'} mb={'2rem'}>
                                            You do not have any SBT yet.
                                            <br />
                                            Complete a booking to display it here.
                                        </Typography>
                                    ) : (
                                        <Typography textAlign={'center'} mb={'2rem'}>
                                            This user do not have any SBT yet.
                                        </Typography>
                                    )}
                                </>
                            )}
                        </Box>
                    </Container>
                </Box>
            </Layout>
        </>
    );
}

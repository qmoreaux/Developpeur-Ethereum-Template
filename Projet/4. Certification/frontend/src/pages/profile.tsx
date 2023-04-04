import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Axios from 'axios';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';

import { useAlertContext, useContractContext } from '@/context';

import { useNetwork, useAccount } from 'wagmi';
import { Container, Typography, Box, Card, Grid, CardContent, CardMedia } from '@mui/material';

import INFTItem from '../interfaces/NFTItem';
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
    const [SBTCollection, setSBTCollection] = useState<INFTItem[]>([]);
    const [ratingsAsOwner, setRatingsAsOwner] = useState<IRating[]>([]);
    const [ratingsAsRecipient, setRatingsAsRecipient] = useState<IRating[]>([]);

    useEffect(() => {
        setAddressToUse(router.query.addr ? router.query.addr : address);
        setOwnProfile(router.query.addr ? false : true);
    }, [router.query.addr, address]);

    useEffect(() => {
        if (addressToUse) {
            getRatings();
            // getNFTCollection();
            // getSBTCollection();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain, address, addressToUse]);

    const getRatings = async () => {
        const ratings = await readContract('SmartStayRating', 'getRating', [addressToUse, { from: address }]);
        console.log(ratings);
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

    const getNFTCollection = async () => {
        try {
            const NFTtransaction = await readContract('SmartStayBooking', 'getNFTCollection', [
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

    const getSBTCollection = async () => {
        try {
            const SBTtransaction = await readContract('SmartStayBooking', 'getSBTCollection', [
                addressToUse,
                { from: address }
            ]);
            setSBTCollection(
                await Promise.all<INFTItem[]>(
                    SBTtransaction.map(async (NFTItem: INFTItem) => {
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
                        <Typography variant="h6">Ratings</Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            <Grid container>
                                <Grid item flexGrow={1} textAlign={'center'}>
                                    <Typography variant="h6">Ratings as owner</Typography>
                                    <Typography>
                                        Average rating as owner :
                                        <b>
                                            {getAverageRatingAsOwner()} ({ratingsAsOwner.length} ratings)
                                        </b>
                                    </Typography>
                                    {ratingsAsOwner.map((rating) => (
                                        <Card key={rating.id.toNumber()}>
                                            <CardContent>
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
                                </Grid>
                                <Grid item flexGrow={1} textAlign={'center'}>
                                    <Typography variant="h6">Ratings as recipient</Typography>
                                    <Typography>
                                        Average rating as recipient :
                                        <b>
                                            {getAverageRatingAsRecipient()} ({ratingsAsRecipient.length} ratings)
                                        </b>
                                    </Typography>

                                    {ratingsAsRecipient.map((rating) => (
                                        <Card key={rating.id.toNumber()}>
                                            <CardContent>
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
                                </Grid>
                            </Grid>
                        </Box>
                    </Container>
                    <Container>
                        <Typography variant="h6">Decentralized Identity</Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap"></Box>
                    </Container>
                    <Container>
                        <Typography variant="h6">SmartStay Collection</Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {NFTCollection.map((NFTItem: INFTItem) => (
                                <Card key={NFTItem.tokenID.toString()}>
                                    <CardMedia
                                        component="img"
                                        height="200px"
                                        image={NFTItem.image}
                                        alt="Image rental"
                                        sx={{ backgroundColor: 'white', objectFit: 'contain' }}
                                    ></CardMedia>
                                    <CardContent>
                                        <Typography>NFT ID : #{NFTItem.tokenID.toString()}</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Container>
                    <Container>
                        <Typography variant="h6">SmartStay receipts</Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {SBTCollection.map((SBTItem: INFTItem) => (
                                <Card key={SBTItem.tokenID.toString()}>
                                    <CardMedia
                                        component="img"
                                        height="200px"
                                        image={SBTItem.image}
                                        alt="Image rental"
                                        sx={{ backgroundColor: 'white', objectFit: 'contain' }}
                                    ></CardMedia>
                                    <CardContent>
                                        <Typography>SBT ID : #{SBTItem.tokenID.toString()}</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Container>
                </Box>
            </Layout>
        </>
    );
}

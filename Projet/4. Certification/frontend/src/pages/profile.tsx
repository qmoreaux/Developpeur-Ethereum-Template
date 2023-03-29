import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Axios from 'axios';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import NewRentingDialog from '@/dialogs/NewRenting';
import UpdateRentingDialog from '@/dialogs/UpdateRenting';
import DeleteRentingDialog from '@/dialogs/DeleteRenting';

import { ethers, BigNumber } from 'ethers';
import { useNetwork, useProvider, useAccount } from 'wagmi';
import { Container, Typography, Box, Card, CardContent, CardMedia } from '@mui/material';
import { Add, Update, Delete } from '@mui/icons-material';

import artifacts from '../../contracts/SmartStay.json';

import IRenting from '../interfaces/Renting';
import INetworks from '../interfaces/Networks';
import INFTItem from '../interfaces/NFTItem';

export default function Profile() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();

    const [NFTCollection, setNFTCollection] = useState<INFTItem[]>([]);
    const [SBTCollection, setSBTCollection] = useState<INFTItem[]>([]);

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract(
                        (artifacts.networks as INetworks)[chain.id].address,
                        artifacts.abi,
                        provider
                    );
                    const NFTtransaction = await contract.getNFTCollection(address, { from: address });
                    setNFTCollection(
                        await Promise.all<INFTItem[]>(
                            NFTtransaction.map(async (NFTItem: any) => {
                                let meta = await Axios.get(NFTItem.tokenURI);
                                meta = meta.data;
                                return {
                                    ...meta,
                                    tokenID: NFTItem.tokenID
                                };
                            })
                        )
                    );

                    const SBTtransaction = await contract.getSBTCollection(address, { from: address });
                    setSBTCollection(
                        await Promise.all<INFTItem[]>(
                            SBTtransaction.map(async (NFTItem: any) => {
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
                    console.error(e);
                }
            }
        })();
    }, [provider, chain, address]);

    return (
        <>
            <Head>
                <title>SmartStay: Profile</title>
                <meta name="description" content="SmartStay project for Alyra certification" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                <Container>
                    <Typography variant="h6">My NFT Collection</Typography>
                    <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                        {NFTCollection.map((NFTItem: any) => (
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
                    <Typography variant="h6">My SBT Collection</Typography>
                    <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                        {SBTCollection.map((SBTItem: any) => (
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
            </Layout>
        </>
    );
}

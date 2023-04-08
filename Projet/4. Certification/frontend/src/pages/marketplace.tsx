import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useNetwork, useAccount, useSigner, useProvider } from 'wagmi';

import { ethers, BigNumber } from 'ethers';

import Axios from 'axios';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import Available from '@/components/Marketplace/Available';
import MyListed from '@/components/Marketplace/MyListed';
import Listed from '@/components/Marketplace/Listed';

import { useAlertContext, useContractContext } from '@/context';

import { Container, Typography, Box, Card, Button, CardContent, CardMedia } from '@mui/material';

import INFTItem from '../interfaces/NFTItem';
import IArtifacts from '@/interfaces/Artifacts';

import artifacts from '../../contracts/SmartStay.json';

export default function Marketplace() {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();

    const { setAlert } = useAlertContext();
    const { readContract, writeContract } = useContractContext();

    const [NFTCollection, setNFTCollection] = useState<INFTItem[]>([]);
    const [listedNFT, setListedNFT] = useState<INFTItem[]>([]);
    const [myListedNFT, setMyListedNFT] = useState<INFTItem[]>([]);

    const [NFTCollectionAddress, setNFTCollectionAddress] = useState<string>('');

    const getCollectionAddress = async () => {
        setNFTCollectionAddress(await readContract('SmartStayBooking', 'getNFTCollection', [{ from: address }]));
    };

    const getTokenMetadata = async (token: INFTItem) => {
        const contract = await new ethers.Contract(
            NFTCollectionAddress,
            (artifacts as IArtifacts).SmartStayNFTCollection.abi,
            provider
        );
        const tokenURI = await contract.tokenURI(token.tokenID.toNumber(), { from: address });
        const meta = await Axios.get(tokenURI);
        return {
            ...token,
            ...meta.data
        };
    };

    const getListedNFT = async () => {
        const _listedNFT = await readContract('SmartStayMarketplace', 'getListedNFT', [{ from: address }]);
        const _filteredListedNFT = _listedNFT.filter((NFTItem: any) => NFTItem.owner !== address);
        setListedNFT(
            await Promise.all<INFTItem[]>(
                _filteredListedNFT.map(async (NFTItem: INFTItem) => {
                    return await getTokenMetadata(NFTItem);
                })
            )
        );
    };

    const getMyListedNFT = async () => {
        const _myListedNFT = await readContract('SmartStayMarketplace', 'getMyListedNFT', [{ from: address }]);
        setMyListedNFT(
            await Promise.all<INFTItem[]>(
                _myListedNFT.map(async (NFTItem: INFTItem) => {
                    return await getTokenMetadata(NFTItem);
                })
            )
        );
    };

    const getUserNFT = async () => {
        try {
            const _userNFT = await readContract('SmartStayBooking', 'getUserNFT', [address, { from: address }]);
            const _filteredUserNFT = _userNFT.filter((NFTItem: any) => {
                return (
                    myListedNFT.findIndex(
                        (listedNFTItem) => listedNFTItem.tokenID.toNumber() === NFTItem.tokenID.toNumber()
                    ) === -1
                );
            });
            setNFTCollection(
                await Promise.all<INFTItem[]>(
                    _filteredUserNFT.map(async (NFTItem: INFTItem) => {
                        return await getTokenMetadata(NFTItem);
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

    const onItemListed = (token: INFTItem) => {
        setNFTCollection(
            NFTCollection.filter((NFTItem: any) => {
                return NFTItem.tokenID !== token.tokenID;
            })
        );
        setMyListedNFT([...myListedNFT, { ...token }]);
    };

    const onItemDelisted = (token: INFTItem) => {
        setNFTCollection([...NFTCollection, token]);
        setMyListedNFT(
            myListedNFT.filter((NFTItem: any) => {
                return NFTItem.tokenID !== token.tokenID;
            })
        );
    };

    const onItemSold = (token: INFTItem) => {
        setNFTCollection([...NFTCollection, token]);
        setListedNFT(
            listedNFT.filter((NFTItem: any) => {
                return NFTItem.tokenID !== token.tokenID;
            })
        );
    };

    useEffect(() => {
        getCollectionAddress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain, address]);

    useEffect(() => {
        if (NFTCollectionAddress) {
            getMyListedNFT();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [NFTCollectionAddress]);

    useEffect(() => {
        if (NFTCollectionAddress) {
            getListedNFT();
            getUserNFT();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myListedNFT, NFTCollectionAddress]);

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
                        Marketplace
                    </Typography>
                    <Container>
                        <Typography variant="h5" mb={'2rem'}>
                            Your NFT available for listing
                        </Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {NFTCollection.length ? (
                                <>
                                    {NFTCollection.map((NFTItem: INFTItem) => (
                                        <Available
                                            key={NFTItem.tokenID.toString()}
                                            NFTCollectionAddress={NFTCollectionAddress}
                                            NFTItem={NFTItem}
                                            onItemListed={onItemListed}
                                        ></Available>
                                    ))}
                                </>
                            ) : (
                                <Typography textAlign={'center'} mb={'2rem'}>
                                    You do not have any NFT available for listing yet.
                                    <br /> Redeem it after a booking to display it here.
                                </Typography>
                            )}
                        </Box>
                    </Container>
                    <Container>
                        <Typography variant="h5" mb={'2rem'}>
                            Your NFT listed for sale
                        </Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {myListedNFT.length ? (
                                <>
                                    {myListedNFT.map((NFTItem: any) => (
                                        <MyListed
                                            key={NFTItem.tokenID.toString()}
                                            NFTItem={NFTItem}
                                            onItemDelisted={onItemDelisted}
                                        ></MyListed>
                                    ))}
                                </>
                            ) : (
                                <Typography textAlign={'center'} mb={'2rem'}>
                                    You do not have any NFT yet.
                                    <br /> Redeem it after a booking to display it here.
                                </Typography>
                            )}
                        </Box>
                    </Container>
                    <Container>
                        <Typography variant="h5" mb={'2rem'}>
                            NFT available for purchase
                        </Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {listedNFT.length ? (
                                <>
                                    {listedNFT.map((NFTItem: INFTItem) => (
                                        <Listed
                                            key={NFTItem.tokenID.toString()}
                                            NFTItem={NFTItem}
                                            onItemSold={onItemSold}
                                        ></Listed>
                                    ))}
                                </>
                            ) : (
                                <Typography textAlign={'center'} mb={'2rem'}>
                                    There is no NFT available for purchase yet
                                </Typography>
                            )}
                        </Box>
                    </Container>
                </Box>
            </Layout>
        </>
    );
}

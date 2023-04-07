import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useNetwork, useAccount, useSigner } from 'wagmi';

import { ethers, BigNumber } from 'ethers';

import Axios from 'axios';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';

import { useAlertContext, useContractContext } from '@/context';

import { Container, Typography, Box, Card, Button, CardContent, CardMedia } from '@mui/material';

import INFTItem from '../interfaces/NFTItem';
import IArtifacts from '@/interfaces/Artifacts';

import artifacts from '../../contracts/SmartStay.json';

export default function Marketplace() {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const router = useRouter();
    const { data: signer } = useSigner();

    const { setAlert } = useAlertContext();
    const { readContract, writeContract } = useContractContext();

    const [price, setPrice] = useState<number>(10);

    const [NFTCollection, setNFTCollection] = useState<INFTItem[]>([]);
    const [listedNFT, setListedNFT] = useState<INFTItem[]>([]);
    const [myListedNFT, setMyListedNFT] = useState<INFTItem[]>([]);

    const [NFTCollectionAddress, setNFTCollectionAddress] = useState<string>('');

    useEffect(() => {
        try {
            getCollectionAddress();
            getMyListedNFT();
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain, address]);

    useEffect(() => {
        getListedNFT();
        getUserNFT();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myListedNFT]);

    const getCollectionAddress = async () => {
        setNFTCollectionAddress(await readContract('SmartStayBooking', 'getNFTCollection', [{ from: address }]));
    };

    const getListedNFT = async () => {
        const _listedNFT = await readContract('SmartStayMarketplace', 'getListedNFT', [{ from: address }]);
        setListedNFT(_listedNFT.filter((NFTItem: any) => NFTItem.owner !== address));
    };

    const getMyListedNFT = async () => {
        setMyListedNFT(await readContract('SmartStayMarketplace', 'getMyListedNFT', [{ from: address }]));
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

    const listOnMarketplace = async (token: INFTItem) => {
        try {
            // await approveMarketplace(tokenID);
            // const transaction = await writeContract('SmartStayMarketplace', 'listToken', [
            //     tokenID,
            //     price,
            //     { from: address }
            // ]);
            // await transaction.wait();
            // setAlert({ message: 'Your NFT has successfully been listed', severity: 'success' });
            const tokenToList = NFTCollection.filter((NFTItem: any) => {
                return NFTItem.tokenID === token.tokenID;
            })[0];
            setNFTCollection(
                NFTCollection.filter((NFTItem: any) => {
                    return NFTItem.tokenID !== token.tokenID;
                })
            );
            setMyListedNFT([...myListedNFT, { ...tokenToList, price: BigNumber.from(price) }]);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
    };

    const delistToken = async (token: INFTItem) => {
        try {
            // const transaction = await writeContract('SmartStayMarketplace', 'delistToken', [
            //     tokenID,
            //     { from: address }
            // ]);
            // await transaction.wait();
            // setAlert({ message: 'Your NFT has successfully been delisted', severity: 'success' });
            const tokenToDelist = myListedNFT.filter((NFTItem: any) => {
                return NFTItem.tokenID === token.tokenID;
            })[0];
            setNFTCollection([...NFTCollection, tokenToDelist]);
            setMyListedNFT(
                myListedNFT.filter((NFTItem: any) => {
                    return NFTItem.tokenID !== token.tokenID;
                })
            );
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
    };

    const executeSale = async (token: any) => {
        try {
            // const transaction = await writeContract('SmartStayMarketplace', 'delistToken', [
            //     token.id,
            //     { value: token.price, from: address }
            // ]);
            // await transaction.wait();
            // setAlert({ message: 'NFT successfully purchased', severity: 'success' });
            // TODO Remove from NFT available for purchase and move to NFT available
            const tokenToDelist = listedNFT.filter((NFTItem: any) => {
                return NFTItem.tokenID === token.tokenID;
            })[0];
            setNFTCollection([...NFTCollection, tokenToDelist]);
            setListedNFT(
                listedNFT.filter((NFTItem: any) => {
                    return NFTItem.tokenID !== token.tokenID;
                })
            );
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
    };

    const approveMarketplace = async (tokenID: number) => {
        if (chain && signer) {
            const contract = new ethers.Contract(
                NFTCollectionAddress,
                (artifacts as IArtifacts).SmartStayNFTCollection.abi,
                signer
            );
            await contract.approve((artifacts as IArtifacts).SmartStayMarketplace.networks[chain.id].address, tokenID);
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
                        Marketplace
                    </Typography>
                    <Container>
                        <Typography variant="h5" mb={'2rem'}>
                            Your NFT available
                        </Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {NFTCollection.length ? (
                                <>
                                    {NFTCollection.map((NFTItem: INFTItem) => (
                                        <Card key={NFTItem.tokenID.toString()} sx={{ marginBottom: '2rem' }}>
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
                                                <Button variant="contained" onClick={() => listOnMarketplace(NFTItem)}>
                                                    List on marketplace
                                                </Button>
                                            </CardContent>
                                        </Card>
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
                            Your NFT listed for sale
                        </Typography>
                        <Box display="flex" justifyContent={'space-evenly'} flexWrap="wrap">
                            {myListedNFT.length ? (
                                <>
                                    {myListedNFT.map((NFTItem: any) => (
                                        <Card key={NFTItem.tokenID.toString()} sx={{ marginBottom: '2rem' }}>
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
                                                <Typography>
                                                    Listed price : {ethers.utils.formatEther(NFTItem.price)} ETH
                                                </Typography>
                                                <Button variant="contained" onClick={() => delistToken(NFTItem)}>
                                                    Delist
                                                </Button>
                                            </CardContent>
                                        </Card>
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
                                        <Card key={NFTItem.tokenID.toString()} sx={{ marginBottom: '2rem' }}>
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
                                                <Button variant="contained" onClick={() => executeSale(NFTItem)}>
                                                    Buy
                                                </Button>
                                            </CardContent>
                                        </Card>
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

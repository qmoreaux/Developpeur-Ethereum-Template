import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import NewRentingDialog from '@/dialogs/NewRenting';
import UpdateRentingDialog from '@/dialogs/UpdateRenting';
import DeleteRentingDialog from '@/dialogs/DeleteRenting';

import { ethers, BigNumber } from 'ethers';
import { useNetwork, useProvider, useAccount } from 'wagmi';
import { Button, Typography, Box, Card, CardContent, CardMedia } from '@mui/material';
import { Add, Update, Delete } from '@mui/icons-material';

import artifacts from '../../contracts/SmartStay.json';

import IRenting from '../interfaces/Renting';
import INetworks from '../interfaces/Networks';

export default function Profile() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract(
                        (artifacts.networks as INetworks)[chain.id].address,
                        artifacts.abi,
                        provider
                    );
                    console.log(await contract.getNFTURI(BigNumber.from(1), { from: address }));
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
            <Layout>DAda</Layout>
        </>
    );
}

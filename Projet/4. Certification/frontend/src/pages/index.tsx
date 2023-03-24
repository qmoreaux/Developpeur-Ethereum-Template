import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import { useAccount } from 'wagmi';
import { Typography } from '@mui/material';

export default function Home() {
    const { isConnected } = useAccount();

    return (
        <>
            <Head>
                <title>SmartStay</title>
                <meta name="description" content="SmartStay project for Alyra certification" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                {isConnected ? (
                    <Typography>Welcome on Alyra DApp !</Typography>
                ) : (
                    <Typography> Please, connect your Wallet!</Typography>
                )}
            </Layout>
        </>
    );
}

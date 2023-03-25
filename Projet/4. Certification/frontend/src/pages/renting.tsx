import Head from "next/head";
import Layout from "@/components/Layout/Layout";
import { useNetwork, useProvider } from "wagmi";
import { ethers } from "ethers";
import { networks, abi } from "../../contracts/SmartStay.json";

import { Typography } from "@mui/material";
import { useEffect } from "react";

interface Networks {
    [key: string]: any;
}

export default function Renting() {
    const { chain } = useNetwork();
    const provider = useProvider();

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, provider);
                    const data = await contract.searchRenting(10, 5);
                    console.log(data);
                } catch (e) {
                    console.log(e);
                }
            }
        })();
    }, []);

    

    return (
        <>
            <Head>
                <title>SmartStay: Renting</title>
                <meta name="description" content="SmartStay project for Alyra certification" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>TOTO</Layout>
        </>
    );
}

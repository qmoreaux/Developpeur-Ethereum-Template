import { useState } from 'react';

import { useNetwork, useAccount, useSigner } from 'wagmi';

import { ethers, BigNumber } from 'ethers';

import { useAlertContext, useContractContext } from '@/context';

import { Typography, Card, Button, CardContent, CardMedia } from '@mui/material';

import INFTItem from '@/interfaces/NFTItem';
import IArtifacts from '@/interfaces/Artifacts';

import artifacts from '../../../contracts/SmartStay.json';

export default function Available({ NFTCollectionAddress, NFTItem, onItemListed }: any) {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const [price, setPrice] = useState<number>(10);

    const listOnMarketplace = async (token: INFTItem) => {
        try {
            await approveMarketplace(token);
            const transaction = await writeContract('SmartStayMarketplace', 'listToken', [
                token.tokenID,
                price,
                { from: address }
            ]);
            await transaction.wait();
            setAlert({ message: 'Your NFT has successfully been listed', severity: 'success' });

            onItemListed({ ...token, price: BigNumber.from(price) });
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
    };

    const approveMarketplace = async (token: INFTItem) => {
        if (chain && signer) {
            const contract = new ethers.Contract(
                NFTCollectionAddress,
                (artifacts as IArtifacts).SmartStayNFTCollection.abi,
                signer
            );
            if (
                (await contract.getApproved(token.tokenID)) !==
                (artifacts as IArtifacts).SmartStayMarketplace.networks[chain.id].address
            ) {
                await contract.approve(
                    (artifacts as IArtifacts).SmartStayMarketplace.networks[chain.id].address,
                    token.tokenID
                );
            }
        }
    };

    return (
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
    );
}

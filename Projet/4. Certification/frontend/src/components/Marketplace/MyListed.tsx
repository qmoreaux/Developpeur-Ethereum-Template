import { useAccount } from 'wagmi';

import { ethers } from 'ethers';

import { useAlertContext, useContractContext } from '@/context';

import { Typography, Card, Button, CardContent, CardMedia } from '@mui/material';

import INFTItem from '@/interfaces/NFTItem';

export default function MyListed({ NFTItem, onItemDelisted }: any) {
    const { address } = useAccount();

    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const delistToken = async (token: INFTItem) => {
        try {
            const transaction = await writeContract('SmartStayMarketplace', 'delistToken', [
                token.tokenID,
                { from: address }
            ]);
            await transaction.wait();
            setAlert({ message: 'Your NFT has successfully been delisted', severity: 'success' });
            onItemDelisted(token);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
    };

    return (
        <Card sx={{ marginBottom: '2rem' }}>
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
                <Typography>Listed price : {ethers.utils.formatEther(NFTItem.price)} ETH</Typography>
                <Button variant="contained" onClick={() => delistToken(NFTItem)}>
                    Delist from marketplace
                </Button>
            </CardContent>
        </Card>
    );
}

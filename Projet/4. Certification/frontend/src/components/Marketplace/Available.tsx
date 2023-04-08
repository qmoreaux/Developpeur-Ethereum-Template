import { useState } from 'react';

import { useNetwork, useAccount, useSigner } from 'wagmi';

import { ethers, BigNumber } from 'ethers';

import { useAlertContext, useContractContext } from '@/context';

import { TextField, Typography, Card, Stack, Button, CardContent, CardMedia, InputAdornment } from '@mui/material';
import { AttachMoney } from '@mui/icons-material';

import INFTItem from '@/interfaces/NFTItem';
import IArtifacts from '@/interfaces/Artifacts';

import artifacts from '../../../contracts/SmartStay.json';

export default function Available({ NFTCollectionAddress, NFTItem, onItemListed }: any) {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const [showPrice, setShowPrice] = useState<boolean>(false);
    const [price, setPrice] = useState<string>('');

    const isValidPrice = () => {
        return /^\d{0,3}(\.\d{0,18})?$/.test(price);
    };

    const listOnMarketplace = async (token: INFTItem) => {
        try {
            await approveMarketplace(token);
            const transaction = await writeContract('SmartStayMarketplace', 'listToken', [
                token.tokenID,
                ethers.utils.parseEther(price)
            ]);
            await transaction.wait();
            setAlert({ message: 'Your NFT has successfully been listed', severity: 'success' });

            onItemListed({ ...token, price: ethers.utils.parseEther(price) });
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

                {showPrice ? (
                    <Stack>
                        <TextField
                            margin="dense"
                            size="small"
                            label="Price"
                            InputProps={{
                                inputProps: {
                                    min: 0
                                },
                                endAdornment: <InputAdornment position="end">ETH</InputAdornment>
                            }}
                            error={!isValidPrice()}
                            helperText={isValidPrice() ? '' : 'Wrong format'}
                            onChange={(event) => {
                                setPrice(event.target.value);
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={() => listOnMarketplace(NFTItem)}
                            disabled={!isValidPrice() || price === ''}
                        >
                            List on marketplace
                        </Button>
                    </Stack>
                ) : (
                    <Button variant="contained" onClick={() => setShowPrice(true)}>
                        List on marketplace
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

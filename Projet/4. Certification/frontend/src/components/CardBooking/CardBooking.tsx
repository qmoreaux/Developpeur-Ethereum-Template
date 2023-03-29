import { useState } from 'react';

import { Typography, Box, Card, CardContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ethers } from 'ethers';
import { useNetwork, useSigner } from 'wagmi';

import artifacts from '../../../contracts/SmartStay.json';

import IBooking from '../../interfaces/Booking';
import INetworks from '../../interfaces/Networks';

import { uploadJSONToIPFS } from '../../pinata';

import Created from './Status/Created';
import WaitingForPayement from './Status/WaitingForPayment';
import OnGoing from './Status/OnGoing';
import Validated from './Status/Validated';
import Completed from './Status/Completed';
import Rejected from './Status/Rejected';
import Cancelled from './Status/Cancelled';

export default function CardBooking({ _booking, type }: any) {
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const [booking, setBooking] = useState<IBooking>(_booking);

    const [loadingRedeem, setLoadingRedeem] = useState(false);

    const handleRedeemNFT = async () => {
        if (signer && chain && chain.id) {
            setLoadingRedeem(true);
            try {
                const NFTMetadata = {
                    image: 'https://gateway.pinata.cloud/ipfs/QmVYCK5rjSUPV19bGG1LDsD9hbCtyZ12Z7XLYqqceH6V7U',
                    name: 'Dada',
                    description: 'Didi',
                    attributes: [
                        {
                            trait_type: 'Booking',
                            value: booking.id
                        },
                        {
                            trait_type: 'Toto',
                            value: 10
                        }
                    ]
                };

                const response = await uploadJSONToIPFS(NFTMetadata, 'metadata_nft_booking_' + booking.id);

                if (response.success === true) {
                    const contract = new ethers.Contract(
                        (artifacts.networks as INetworks)[chain.id].address,
                        artifacts.abi,
                        signer
                    );
                    const transaction = await contract.redeemNFT(booking.id.toNumber(), response.pinataURL);
                    await transaction.wait();

                    setBooking({ ...booking, NFTRedeemed: true });
                    setLoadingRedeem(false);
                }
            } catch (e) {
                setLoadingRedeem(false);
                console.error(e);
            }
        }
    };

    return (
        <>
            {booking && booking.id ? (
                <Card
                    sx={{
                        backgroundColor: 'whitesmoke',
                        width: '400px',
                        boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                        marginBottom: '1rem'
                    }}
                >
                    <CardContent>
                        <Typography>Booking ID : #{booking.id.toString()}</Typography>
                        <Typography>
                            {' '}
                            Start date : {new Date(booking.timestampStart.toNumber() * 1000).toLocaleDateString()}
                        </Typography>
                        <Typography>Person count: {booking.personCount.toString()}</Typography>
                        <Typography>Duration : {booking.duration.toString()} days</Typography>
                        <Box
                            display="flex"
                            justifyContent={booking.status === 0 && type === 'owner' ? 'space-between' : 'center'}
                            mt="1rem"
                        >
                            {booking.status === 0 ? (
                                <Created booking={booking} setBooking={setBooking} type={type}></Created>
                            ) : booking.status === 1 ? (
                                <WaitingForPayement
                                    booking={booking}
                                    setBooking={setBooking}
                                    type={type}
                                ></WaitingForPayement>
                            ) : booking.status === 2 ? (
                                <OnGoing booking={booking} setBooking={setBooking} type={type}></OnGoing>
                            ) : booking.status === 3 ? (
                                <Validated booking={booking} setBooking={setBooking} type={type}></Validated>
                            ) : booking.status === 4 ? (
                                <Completed booking={booking} setBooking={setBooking} type={type}></Completed>
                            ) : booking.status === 5 ? (
                                <Rejected booking={booking} setBooking={setBooking} type={type}></Rejected>
                            ) : booking.status === 6 ? (
                                <Cancelled booking={booking} setBooking={setBooking} type={type}></Cancelled>
                            ) : (
                                ''
                            )}
                        </Box>
                        {type === 'recipient' && !booking.NFTRedeemed && booking.status >= 2 && booking.status <= 4 ? (
                            <Box
                                display="flex"
                                justifyContent={booking.status === 0 && type === 'owner' ? 'space-between' : 'center'}
                                mt="1rem"
                            >
                                <LoadingButton loading={loadingRedeem} variant="contained" onClick={handleRedeemNFT}>
                                    Redeem NFT
                                </LoadingButton>
                            </Box>
                        ) : (
                            ''
                        )}
                    </CardContent>
                </Card>
            ) : (
                ''
            )}
        </>
    );
}

import { useState } from 'react';

import { Typography, Box, Card, CardContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useAccount } from 'wagmi';

import { useAlertContext, useContractContext } from '@/context';

import IBooking from '../../interfaces/Booking';
import ICardBooking from '../../interfaces/CardBooking';

import { uploadJSONToIPFS } from '../../pinata';

import Created from './Status/Created';
import WaitingForPayement from './Status/WaitingForPayment';
import OnGoing from './Status/OnGoing';
import Validated from './Status/Validated';
import Completed from './Status/Completed';
import Rejected from './Status/Rejected';
import Cancelled from './Status/Cancelled';

export default function CardBooking({ _booking, type }: ICardBooking) {
    const { address } = useAccount();

    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const [booking, setBooking] = useState<IBooking>(_booking);

    const [loadingRedeem, setLoadingRedeem] = useState(false);

    const handleRedeemNFT = async () => {
        setLoadingRedeem(true);
        try {
            const NFTMetadata = {
                image: `https://gateway.pinata.cloud/ipfs/QmP5xTq4AwNnSLj6r3hX44UBxsZcvMKxPucX4AY8MqUBya/${
                    Math.floor(Math.random() * 10) + 1
                }.png`,
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
                const transaction = await writeContract('redeemNFT', [
                    booking.id.toNumber(),
                    response.pinataURL,
                    { from: address }
                ]);
                await transaction.wait();

                setAlert({ message: 'Your NFT was successfully minted', severity: 'success' });
                setBooking({ ...booking, NFTRedeemed: true });
                setLoadingRedeem(false);
            }
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingRedeem(false);
            console.error(e);
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
                                justifyContent={booking.status === 0 ? 'space-between' : 'center'}
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

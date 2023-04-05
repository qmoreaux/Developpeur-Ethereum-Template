import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

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
import IRenting from '@/interfaces/Renting';

export default function CardBooking({ _booking, type }: ICardBooking) {
    const { address } = useAccount();

    const router = useRouter();

    const { setAlert } = useAlertContext();
    const { readContract, writeContract } = useContractContext();

    const [booking, setBooking] = useState<IBooking>(_booking);
    const [renting, setRenting] = useState<IRenting>({} as IRenting);

    const [loadingRedeem, setLoadingRedeem] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setRenting(
                    await readContract('SmartStayBooking', 'getRentingFromBookingID', [booking.id, { from: address }])
                );
            } catch (e) {
                setAlert({
                    message: 'An error has occurred. Check the developer console for more information',
                    severity: 'error'
                });
                console.error(e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [booking, address]);

    const handleRedeemNFT = async () => {
        setLoadingRedeem(true);
        try {
            const NFTMetadata = {
                image: `https://gateway.pinata.cloud/ipfs/QmP5xTq4AwNnSLj6r3hX44UBxsZcvMKxPucX4AY8MqUBya/${
                    Math.floor(Math.random() * 10) + 1
                }.png`,
                name: 'NFT for Booking #' + booking.id,
                description: '',
                attributes: []
            };

            const response = await uploadJSONToIPFS(NFTMetadata, 'metadata_nft_booking_' + booking.id);

            if (response.success === true) {
                const transaction = await writeContract('SmartStayBooking', 'redeemNFT', [
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
                        {type === 'owner' ? (
                            <Typography
                                onClick={() => {
                                    router.push('/profile?addr=' + booking.recipient);
                                }}
                                sx={{
                                    textDecoration: 'underline',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    color: '#1976d2',
                                    marginTop: '1rem'
                                }}
                            >
                                View recipient profile
                            </Typography>
                        ) : (
                            <Typography
                                onClick={() => {
                                    router.push('/profile?addr=' + renting.owner);
                                }}
                                sx={{
                                    textDecoration: 'underline',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    color: '#1976d2',
                                    marginTop: '1rem'
                                }}
                            >
                                View owner profile
                            </Typography>
                        )}
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

import { useState } from 'react';

import { Button, Typography, Box, Card, CardContent, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ethers, BigNumber } from 'ethers';
import { useNetwork, useProvider, useSigner, useAccount } from 'wagmi';

import artifacts from '../../../contracts/SmartStay.json';

import IBooking from '../../interfaces/Booking';
import INetworks from '../../interfaces/Networks';

import { uploadJSONToIPFS } from '../../pinata';

export default function CardBooking({ _booking, type }: any) {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();
    const { data: signer } = useSigner();

    const [booking, setBooking] = useState<IBooking>(_booking);

    const [loadingAccept, setLoadingAccept] = useState(false);
    const [loadingRefuse, setLoadingRefuse] = useState(false);
    const [loadingPay, setLoadingPay] = useState(false);
    const [loadingCancel, setLoadingCancel] = useState(false);
    const [loadingValidate, setLoadingValidate] = useState(false);
    const [loadingRetrieve, setLoadingRetrieve] = useState(false);
    const [loadingRedeem, setLoadingRedeem] = useState(false);

    const getRenting = async (bookingID: number) => {
        if (provider && chain && chain.id) {
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    provider
                );
                const renting = await contract.getRentingFromBookingID(bookingID, { from: address });
                return renting;
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleAcceptBooking = async () => {
        if (signer && chain && chain.id) {
            setLoadingAccept(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.approveBooking(booking.id);
                await transaction.wait();

                setBooking({ ...booking, status: 2 });
                setLoadingAccept(false);
            } catch (e) {
                console.error(e);
                setLoadingAccept(false);
            }
        }
    };

    const handleRejectBooking = async () => {
        if (signer && chain && chain.id) {
            setLoadingRefuse(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.rejectBooking(booking.id);
                await transaction.wait();

                setBooking({ ...booking, status: 1 });
                setLoadingRefuse(false);
            } catch (e) {
                console.error(e);
                setLoadingRefuse(false);
            }
        }
    };

    const handlePayBooking = async () => {
        if (signer && chain && chain.id) {
            setLoadingPay(true);
            try {
                const SBTMetadata = {
                    image: 'https://gateway.pinata.cloud/ipfs/QmVYCK5rjSUPV19bGG1LDsD9hbCtyZ12Z7XLYqqceH6V7U?_gl=1*1nminnk*_ga*MmIzMjNlOWMtZjM2Zi00MDhhLWEwZjctNGFjNTNkNjliOTUw*_ga_5RMPXG14TE*MTY4MDA4ODQ2Ny4xNi4xLjE2ODAwODg1MjkuNTguMC4w',
                    name: 'Wawa',
                    description: 'dada',
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

                const SBTMetadataOwner = {
                    ...SBTMetadata,
                    attributes: [...SBTMetadata.attributes, { trait_type: 'owner', value: true }]
                };

                const SBTMetadataRecipient = {
                    ...SBTMetadata,
                    attributes: [...SBTMetadata.attributes, { trait_type: 'owner', value: false }]
                };

                const metadataOwner = await uploadJSONToIPFS(SBTMetadataOwner);
                const metadataRecipient = await uploadJSONToIPFS(SBTMetadataRecipient);

                if (metadataOwner.success === true && metadataRecipient.success) {
                    const contract = new ethers.Contract(
                        (artifacts.networks as INetworks)[chain.id].address,
                        artifacts.abi,
                        signer
                    );
                    let renting = await getRenting(booking.id.toNumber());
                    const transaction = await contract.confirmBooking(
                        booking.id.toNumber(),
                        metadataOwner.pinataURL,
                        metadataRecipient.pinataURL,
                        {
                            value: renting.unitPrice.mul(booking.duration).add(renting.caution)
                        }
                    );
                    await transaction.wait();

                    setBooking({ ...booking, status: 3 });
                    setLoadingPay(false);
                }
            } catch (e) {
                console.error(e);
                setLoadingPay(false);
            }
        }
    };

    const handleCancelBooking = async () => {
        if (signer && chain && chain.id) {
            setLoadingCancel(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.cancelBooking(booking.id, { from: address });
                await transaction.wait();

                setBooking({ ...booking, status: 6 });
                setLoadingCancel(false);
            } catch (e) {
                console.error(e);
                setLoadingCancel(false);
            }
        }
    };

    const handleRedeemNFT = async () => {
        if (signer && chain && chain.id) {
            setLoadingRedeem(true);
            try {
                const NFTMetadata = {
                    image: 'https://gateway.pinata.cloud/ipfs/QmVYCK5rjSUPV19bGG1LDsD9hbCtyZ12Z7XLYqqceH6V7U?_gl=1*1nminnk*_ga*MmIzMjNlOWMtZjM2Zi00MDhhLWEwZjctNGFjNTNkNjliOTUw*_ga_5RMPXG14TE*MTY4MDA4ODQ2Ny4xNi4xLjE2ODAwODg1MjkuNTguMC4w',
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

                const response = await uploadJSONToIPFS(NFTMetadata);

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

    const handleValidateBookingAsOwner = async () => {
        if (signer && chain && chain.id) {
            setLoadingValidate(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.validateBookingAsOwner(booking.id.toNumber());
                await transaction.wait();
                setBooking({
                    ..._booking,
                    validatedOwner: true,
                    status: booking.validatedRecipient ? 4 : 3
                });
                setLoadingValidate(false);
            } catch (e) {
                console.error(e);
                setLoadingValidate(false);
            }
        }
    };

    const handleValidateBookingAsRecipient = async () => {
        if (signer && chain && chain.id) {
            setLoadingValidate(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.validateBookingAsRecipient(booking.id.toNumber());
                await transaction.wait();
                setBooking({
                    ..._booking,
                    validatedRecipient: true,
                    status: booking.validatedOwner ? 4 : 3
                });
                setLoadingValidate(false);
            } catch (e) {
                console.error(e);
                setLoadingValidate(false);
            }
        }
    };

    const handleRetrieveCaution = async () => {
        if (signer && chain && chain.id) {
            setLoadingRetrieve(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.retrieveCaution(booking.id.toNumber());
                await transaction.wait();
                setBooking({
                    ..._booking,
                    cautionLocked: BigNumber.from(0),
                    status: booking.amountLocked.toString() === '0' ? 5 : 4
                });
                setLoadingRetrieve(false);
            } catch (e) {
                console.error(e);
                setLoadingRetrieve(false);
            }
        }
    };

    const handleRetrieveAmount = async () => {
        if (signer && chain && chain.id) {
            setLoadingRetrieve(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.retrieveAmount(booking.id.toNumber());
                await transaction.wait();
                setBooking({
                    ..._booking,
                    amountLocked: BigNumber.from(0),
                    status: booking.cautionLocked.toString() === '0' ? 5 : 4
                });
                setLoadingRetrieve(false);
            } catch (e) {
                console.error(e);
                setLoadingRetrieve(false);
            }
        }
    };

    const isBookingStarted = (): boolean => {
        return new Date().getTime() / 1000 > booking.timestampStart.toNumber();
    };

    const isBookingEnded = (): boolean => {
        return new Date().getTime() / 1000 > booking.timestampEnd.toNumber();
    };

    const getTimeToEnd = (timestampEnd: number) => {
        const data = {
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0
        };
        const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
        const DAYS_IN_SECONDS = 60 * 60 * 24;
        const HOURS_IN_SECONDS = 60 * 60;
        const MINUTES_IN_SECONDS = 60;
        let timeToEnd: number = Math.trunc(timestampEnd - new Date().getTime() / 1000);
        data.weeks = Math.trunc(timeToEnd / WEEK_IN_SECONDS);
        timeToEnd %= WEEK_IN_SECONDS;
        data.days = Math.trunc(timeToEnd / DAYS_IN_SECONDS);
        timeToEnd %= DAYS_IN_SECONDS;
        data.hours = Math.trunc(timeToEnd / HOURS_IN_SECONDS);
        timeToEnd %= HOURS_IN_SECONDS;
        data.minutes = Math.trunc(timeToEnd / MINUTES_IN_SECONDS);
        timeToEnd %= MINUTES_IN_SECONDS;

        return `Booking ends in : ${data.weeks ? data.weeks + ' weeks, ' : ''}${
            data.days ? data.days + ' days, ' : ''
        }${data.hours ? data.hours + ' hours, ' : ''}${data.minutes ? data.minutes + ' minutes' : ''}`;
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
                                <>
                                    {type === 'owner' ? (
                                        <>
                                            <LoadingButton
                                                loading={loadingAccept}
                                                variant="contained"
                                                onClick={() => handleAcceptBooking()}
                                            >
                                                Accept booking
                                            </LoadingButton>
                                            <LoadingButton
                                                loading={loadingRefuse}
                                                variant="contained"
                                                onClick={() => handleRejectBooking()}
                                                color="error"
                                            >
                                                Refuse booking
                                            </LoadingButton>
                                        </>
                                    ) : (
                                        <Typography>Waiting for approval from owner</Typography>
                                    )}
                                </>
                            ) : booking.status === 1 ? (
                                <>
                                    {type === 'owner' ? (
                                        <Typography>Waiting for payment</Typography>
                                    ) : (
                                        <LoadingButton
                                            loading={loadingPay}
                                            variant="contained"
                                            onClick={() => handlePayBooking()}
                                        >
                                            Pay booking
                                        </LoadingButton>
                                    )}
                                </>
                            ) : booking.status === 2 ? (
                                <>
                                    {type === 'owner' ? (
                                        <>
                                            {isBookingEnded() ? (
                                                <>
                                                    {booking.validatedOwner ? (
                                                        <Typography>
                                                            Please wait for the recipient to validate the booking
                                                        </Typography>
                                                    ) : (
                                                        <LoadingButton
                                                            loading={loadingValidate}
                                                            variant="contained"
                                                            onClick={() => handleValidateBookingAsOwner()}
                                                        >
                                                            Validate booking
                                                        </LoadingButton>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>{getTimeToEnd(booking.timestampEnd.toNumber())}</Typography>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {isBookingStarted() ? (
                                                ''
                                            ) : (
                                                <LoadingButton
                                                    loading={loadingCancel}
                                                    variant="contained"
                                                    onClick={handleCancelBooking}
                                                >
                                                    Cancel booking
                                                </LoadingButton>
                                            )}
                                            {isBookingEnded() ? (
                                                <>
                                                    {booking.validatedRecipient ? (
                                                        <Typography>
                                                            Please wait for the owner to validate the booking
                                                        </Typography>
                                                    ) : (
                                                        <LoadingButton
                                                            loading={loadingValidate}
                                                            variant="contained"
                                                            onClick={handleValidateBookingAsRecipient}
                                                        >
                                                            Validate booking
                                                        </LoadingButton>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>{getTimeToEnd(booking.timestampEnd.toNumber())}</Typography>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : booking.status === 3 ? (
                                <>
                                    {type === 'owner' ? (
                                        <Stack>
                                            <Typography>
                                                Amount to get :
                                                <b> {ethers.utils.formatEther(booking.amountLocked)} ETH</b>
                                            </Typography>
                                            {isBookingEnded() ? (
                                                <>
                                                    {booking.amountLocked.toString() !== '0' ? (
                                                        <LoadingButton
                                                            loading={loadingRetrieve}
                                                            variant="contained"
                                                            onClick={() => handleRetrieveAmount()}
                                                        >
                                                            Retrieve amount
                                                        </LoadingButton>
                                                    ) : (
                                                        <Typography>Already retrieved</Typography>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>{getTimeToEnd(booking.timestampEnd.toNumber())}</Typography>
                                            )}
                                        </Stack>
                                    ) : (
                                        <Stack>
                                            <Typography>
                                                Amount to get :
                                                <b> {ethers.utils.formatEther(booking.cautionLocked)} ETH</b>
                                            </Typography>
                                            {isBookingEnded() ? (
                                                <>
                                                    {booking.cautionLocked.toString() !== '0' ? (
                                                        <LoadingButton
                                                            loading={loadingRetrieve}
                                                            variant="contained"
                                                            onClick={() => handleRetrieveCaution()}
                                                        >
                                                            Retrieve caution
                                                        </LoadingButton>
                                                    ) : (
                                                        <Typography>Already retrieved</Typography>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography>{getTimeToEnd(booking.timestampEnd.toNumber())}</Typography>
                                            )}
                                        </Stack>
                                    )}
                                </>
                            ) : booking.status === 4 ? (
                                <Typography>This booking is completed</Typography>
                            ) : booking.status === 5 ? (
                                <>
                                    {type === 'owner' ? (
                                        <Typography>You rejected this booking</Typography>
                                    ) : (
                                        <Typography>The owner rejected this booking</Typography>
                                    )}
                                </>
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

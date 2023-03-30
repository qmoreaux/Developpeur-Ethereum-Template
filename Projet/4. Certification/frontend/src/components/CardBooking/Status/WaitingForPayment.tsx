import { useState } from 'react';

import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ethers } from 'ethers';
import { useNetwork, useProvider, useSigner, useAccount } from 'wagmi';

import { useAlertContext } from '@/context';

import artifacts from '../../../../contracts/SmartStay.json';

import INetworks from '../../../interfaces/Networks';
import ICardBookingStatus from '@/interfaces/CardBookingStatus';

import { uploadJSONToIPFS } from '../../../pinata';

export default function WaitingForPayement({ booking, setBooking, type }: ICardBookingStatus) {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();
    const { data: signer } = useSigner();

    const { setAlert } = useAlertContext();

    const [loadingPay, setLoadingPay] = useState(false);

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
                setAlert({
                    message: 'An error has occurred. Check the developer console for more information',
                    severity: 'error'
                });
                console.error(e);
            }
        }
    };

    const handlePayBooking = async () => {
        if (signer && chain && chain.id) {
            setLoadingPay(true);
            try {
                const SBTMetadata = {
                    image: 'https://gateway.pinata.cloud/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs',
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

                const metadataOwner = await uploadJSONToIPFS(
                    SBTMetadataOwner,
                    'metadata_sbt_owner_booking_' + booking.id
                );
                const metadataRecipient = await uploadJSONToIPFS(
                    SBTMetadataRecipient,
                    'metadata_sbt_recipient_booking_' + booking.id
                );

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
                            value: renting.unitPrice.mul(booking.duration).add(renting.deposit),
                            from: address
                        }
                    );
                    await transaction.wait();

                    setAlert({ message: 'You have successfully payed the booking', severity: 'success' });

                    setBooking({ ...booking, status: 2 });
                    setLoadingPay(false);
                }
            } catch (e) {
                setAlert({
                    message: 'An error has occurred. Check the developer console for more information',
                    severity: 'error'
                });
                setLoadingPay(false);
                console.error(e);
            }
        }
    };

    return (
        <>
            {type === 'owner' ? (
                <Typography>Waiting for payment</Typography>
            ) : (
                <LoadingButton loading={loadingPay} variant="contained" onClick={handlePayBooking}>
                    Pay booking
                </LoadingButton>
            )}
        </>
    );
}

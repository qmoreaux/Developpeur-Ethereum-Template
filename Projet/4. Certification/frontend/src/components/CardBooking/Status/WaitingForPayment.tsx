import { useState } from 'react';

import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useAccount } from 'wagmi';

import { useAlertContext, useContractContext } from '@/context';

import ICardBookingStatus from '@/interfaces/CardBookingStatus';

import { uploadJSONToIPFS } from '../../../pinata';

export default function WaitingForPayement({ booking, setBooking, type }: ICardBookingStatus) {
    const { address } = useAccount();

    const { setAlert } = useAlertContext();
    const { readContract, writeContract } = useContractContext();

    const [loadingPay, setLoadingPay] = useState(false);

    const getRenting = async (bookingID: number) => {
        try {
            return await readContract('SmartStayBooking', 'getRentingFromBookingID', [bookingID, { from: address }]);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error(e);
        }
    };

    const handlePayBooking = async () => {
        setLoadingPay(true);
        try {
            let renting = await getRenting(booking.id.toNumber());

            const SBTMetadata = {
                image: 'https://ipfs.io/ipfs/QmVxnXboDSY9CpBsHZRaZxYDPZPeVKSdxwnAEYznD9vuTs',
                name: 'SmartStay SBT for Booking #' + booking.id,
                description: '',
                attributes: [
                    {
                        trait_type: 'Booking',
                        value: booking.id
                    },
                    {
                        trait_type: 'Duration',
                        value: booking.duration
                    },
                    { trait_type: 'Price', value: renting.price }
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

            const metadataOwner = await uploadJSONToIPFS(SBTMetadataOwner, 'metadata_sbt_owner_booking_' + booking.id);
            const metadataRecipient = await uploadJSONToIPFS(
                SBTMetadataRecipient,
                'metadata_sbt_recipient_booking_' + booking.id
            );

            if (metadataOwner.success === true && metadataRecipient.success) {
                const transaction = await writeContract('SmartStayBooking', 'confirmBooking', [
                    booking.id.toNumber(),
                    metadataOwner.pinataURL,
                    metadataRecipient.pinataURL,
                    {
                        value: renting.unitPrice.mul(booking.duration).add(renting.deposit),
                        from: address
                    }
                ]);
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

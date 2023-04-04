import { useState } from 'react';

import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useNetwork, useSigner, useAccount } from 'wagmi';

import { useAlertContext, useContractContext } from '@/context';

import ICardBookingStatus from '@/interfaces/CardBookingStatus';

export default function Created({ booking, setBooking, type }: ICardBookingStatus) {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const [loadingAccept, setLoadingAccept] = useState(false);
    const [loadingRefuse, setLoadingRefuse] = useState(false);

    const handleAcceptBooking = async () => {
        setLoadingAccept(true);
        try {
            const transaction = await writeContract('approveBooking', [booking.id, { from: address }]);
            await transaction.wait();

            setAlert({ message: 'You have successfully accepted the booking', severity: 'success' });

            setBooking({ ...booking, status: 1 });
            setLoadingAccept(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingAccept(false);
            console.error(e);
        }
    };

    const handleRejectBooking = async () => {
        setLoadingRefuse(true);
        try {
            const transaction = await writeContract('rejectBooking', [booking.id, { from: address }]);
            await transaction.wait();

            setAlert({ message: 'You have successfully rejected the booking', severity: 'success' });

            setBooking({ ...booking, status: 5 });
            setLoadingRefuse(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingRefuse(false);
            console.error(e);
        }
    };

    return (
        <>
            {type === 'owner' ? (
                <>
                    <LoadingButton loading={loadingAccept} variant="contained" onClick={handleAcceptBooking}>
                        Accept booking
                    </LoadingButton>
                    <LoadingButton
                        loading={loadingRefuse}
                        variant="contained"
                        onClick={handleRejectBooking}
                        color="error"
                    >
                        Refuse booking
                    </LoadingButton>
                </>
            ) : (
                <Typography>Waiting for approval from owner</Typography>
            )}
        </>
    );
}

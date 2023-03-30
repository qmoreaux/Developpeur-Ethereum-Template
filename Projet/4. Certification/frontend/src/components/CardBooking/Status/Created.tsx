import { useState } from 'react';

import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ethers } from 'ethers';
import { useNetwork, useSigner, useAccount } from 'wagmi';

import { useAlertContext } from '@/context';

import artifacts from '../../../../contracts/SmartStay.json';

import INetworks from '../../../interfaces/Networks';

export default function Created({ booking, setBooking, type }: any) {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const { setAlert } = useAlertContext();

    const [loadingAccept, setLoadingAccept] = useState(false);
    const [loadingRefuse, setLoadingRefuse] = useState(false);

    const handleAcceptBooking = async () => {
        if (signer && chain && chain.id) {
            setLoadingAccept(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.approveBooking(booking.id, { from: address });
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
                const transaction = await contract.rejectBooking(booking.id, { from: address });
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
        }
    };

    return (
        <>
            {type === 'owner' ? (
                <>
                    <LoadingButton loading={loadingAccept} variant="contained" onClick={() => handleAcceptBooking()}>
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
    );
}

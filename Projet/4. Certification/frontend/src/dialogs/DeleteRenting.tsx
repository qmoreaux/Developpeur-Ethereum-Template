import { useState } from 'react';

import PropTypes from 'prop-types';

import { useAccount } from 'wagmi';
import { useAlertContext, useContractContext } from '@/context';

import { Dialog, DialogTitle, Box, Typography, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { unpinFileFromIPFS } from '../pinata';

import IRenting from '../interfaces/Renting';

interface IRentingDialog {
    open: boolean;
    renting: IRenting;
    onClose: (status: boolean) => void;
}

export default function DeleteRentingDialog(props: IRentingDialog) {
    const { address } = useAccount();
    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const { onClose, renting, open } = props;

    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleClose = (status: boolean) => {
        onClose(status);
    };

    const deleteRenting = async () => {
        setLoadingDelete(true);
        try {
            const transaction = await writeContract('SmartStayRenting', 'deleteRenting', [
                renting.id.toNumber(),
                { from: address }
            ]);
            await transaction.wait();
            await unpinFileFromIPFS(renting.imageURL.slice(34));

            setAlert({ message: 'Your renting has been successfully deleted', severity: 'success' });

            setLoadingDelete(false);
            handleClose(true);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingDelete(false);
            console.error(e);
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Delete a renting</DialogTitle>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                <Typography>Are you sure you want to delete this renting ?</Typography>
                <Box m="1rem" width="80%" display="flex" justifyContent="space-evenly">
                    <LoadingButton loading={loadingDelete} variant="contained" onClick={deleteRenting}>
                        Confirm
                    </LoadingButton>
                    <Button variant="contained" color="error" onClick={() => handleClose(false)}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}

DeleteRentingDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    renting: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired
};

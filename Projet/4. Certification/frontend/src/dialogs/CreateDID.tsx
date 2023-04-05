import { useState, useEffect } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

import { Dialog, DialogTitle, Chip, Stack, Box, Typography, TextField, InputAdornment } from '@mui/material';
import { AttachMoney } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import { useAlertContext, useContractContext } from '@/context';

import { ethers } from 'ethers';
import { useNetwork, useAccount } from 'wagmi';

import { uploadFileToIPFS, updateFileName } from '../pinata';

import IRenting from '../interfaces/Renting';

interface IRentingDialog {
    open: boolean;
    renter: boolean;
    onClose: (status: boolean | IRenting) => void;
}

export default function CreateDIDDialog(props: IRentingDialog) {
    const { address } = useAccount();
    const { chain } = useNetwork();

    const { setAlert } = useAlertContext();
    const { writeContract } = useContractContext();

    const [firstname, setFirstname] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [registeringNumber, setRegisteringNumber] = useState<number>(0);

    const [loadingCreate, setLoadingCreate] = useState(false);

    const { onClose, renter, open } = props;

    const handleClose = (data: IRenting | boolean) => {
        setFirstname('');
        setLastname('');
        setEmail('');
        setRegisteringNumber(0);
        onClose(data);
    };

    const isValidRegisteringNumber = () => {
        return /^[0-9]{0,12}$/.test(registeringNumber.toString());
    };

    const canCreate = () => {
        if (renter) {
            return firstname && lastname && email && registeringNumber;
        } else {
            return firstname && lastname && email;
        }
    };

    const createDID = async () => {
        try {
            setLoadingCreate(true);
            const transaction = await writeContract('SmartStayBooking', 'createDID', [
                address,
                'TODO',
                firstname,
                lastname,
                email,
                registeringNumber,
                {
                    from: address
                }
            ]);
            const receipt = await transaction.wait();
            setAlert({ message: 'Your DID was successfully created', severity: 'success' });
            setLoadingCreate(false);
            handleClose(true);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingCreate(false);
            console.error(e);
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Create your DID</DialogTitle>
            <Typography variant="body1" textAlign={'center'} mb={'1rem'}>
                {renter
                    ? 'Before creating a renting, you must create your DID'
                    : 'Before creating a booking, you must create your DID'}
            </Typography>
            <Stack spacing={2} justifyContent="center" alignItems="center">
                <Box>
                    <TextField
                        label="Firstname"
                        sx={{ width: '300px' }}
                        onChange={(event) => {
                            setFirstname(event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Lastname"
                        sx={{ width: '300px' }}
                        onChange={(event) => {
                            setLastname(event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Email"
                        sx={{ width: '300px' }}
                        onChange={(event) => {
                            setEmail(event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    {renter ? (
                        <TextField
                            label="Registering number"
                            sx={{ width: '300px' }}
                            error={!isValidRegisteringNumber()}
                            helperText={isValidRegisteringNumber() ? '' : 'Wrong format'}
                            onChange={(event) => {
                                setRegisteringNumber(+event.target.value);
                            }}
                        />
                    ) : (
                        ''
                    )}
                </Box>
                <Box
                    sx={{
                        width: '300px'
                    }}
                >
                    <LoadingButton
                        loading={loadingCreate}
                        sx={{ marginBottom: '1rem', width: '100%' }}
                        variant="contained"
                        onClick={createDID}
                        disabled={!canCreate()}
                    >
                        Create
                    </LoadingButton>
                </Box>
            </Stack>
        </Dialog>
    );
}

CreateDIDDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    renter: PropTypes.bool.isRequired,
    open: PropTypes.bool.isRequired
};

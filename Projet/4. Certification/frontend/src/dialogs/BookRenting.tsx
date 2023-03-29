import { useState, useEffect } from 'react';

import PropTypes from 'prop-types';

import { Dialog, DialogTitle, Stack, Box, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ethers } from 'ethers';
import { useNetwork, useSigner } from 'wagmi';

import artifacts from '../../contracts/SmartStay.json';

import INetworks from '../interfaces/Networks';

export default function BookRentingDialog(props: any) {
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const { onClose, open, _renting } = props;

    const [renting, setRenting] = useState<any>({});
    const [startDate, setStartDate] = useState(
        new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
    );
    const [duration, setDuration] = useState(0);
    const [personCount, setPersonCount] = useState(0);

    const [loadingCreate, setLoadingCreate] = useState(false);

    useEffect(() => {
        if (_renting) {
            setRenting(_renting);
        }
    }, [_renting]);

    const handleClose = (data: boolean) => {
        onClose(data);
    };

    const canCreate = () => {
        return startDate && duration && personCount;
    };

    const createBooking = async () => {
        if (signer && chain && chain.id) {
            setLoadingCreate(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.createBooking(
                    renting.id.toNumber(),
                    new Date(new Date(startDate).setHours(0, 0, 0, 0)).getTime() / 1000,
                    duration,
                    personCount
                );
                await transaction.wait();
                setLoadingCreate(false);
                handleClose(true);
            } catch (e) {
                console.error(e);
                setLoadingCreate(false);
            }
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Create a booking</DialogTitle>
            {renting.id ? (
                <Stack spacing={2} justifyContent="center" alignItems="center">
                    <Box>
                        <TextField
                            label="Renting ID"
                            type="number"
                            InputProps={{
                                inputProps: {
                                    min: 0
                                }
                            }}
                            sx={{ width: '300px' }}
                            value={renting.id.toNumber() || 0}
                            disabled
                        />
                    </Box>
                    <Box>
                        <TextField
                            label="Person count"
                            type="number"
                            InputProps={{
                                inputProps: {
                                    min: 0,
                                    max: renting.personCount.toNumber()
                                }
                            }}
                            sx={{ width: '300px' }}
                            value={personCount || 0}
                            onChange={(event) => {
                                setPersonCount(+event.target.value);
                            }}
                        />
                    </Box>
                    <Box>
                        <TextField
                            label="Start Date"
                            type="date"
                            sx={{ width: '300px' }}
                            value={startDate || ''}
                            onChange={(event) => {
                                setStartDate(event.target.value);
                            }}
                        />
                    </Box>
                    <Box>
                        <TextField
                            label="Duration"
                            sx={{ width: '300px' }}
                            value={duration || ''}
                            onChange={(event) => {
                                setDuration(+event.target.value);
                            }}
                        />
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
                            onClick={createBooking}
                            disabled={!canCreate()}
                        >
                            Create
                        </LoadingButton>
                    </Box>
                </Stack>
            ) : (
                ''
            )}
        </Dialog>
    );
}

BookRentingDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    _renting: PropTypes.any.isRequired
};

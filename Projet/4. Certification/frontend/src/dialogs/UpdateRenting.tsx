import { useState, useEffect } from 'react';
import Image from 'next/image';

import PropTypes from 'prop-types';

import { ethers } from 'ethers';
import { useNetwork, useAccount } from 'wagmi';

import { useAlertContext, useContractContext } from '@/context';

import { Dialog, DialogTitle, Chip, Stack, Box, Typography, TextField, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { uploadFileToIPFS, unpinFileFromIPFS } from '../pinata';

import IRenting from '../interfaces/Renting';

interface IRentingDialog {
    open: boolean;
    renting: IRenting;
    onClose: (status: boolean | IRenting) => void;
}

export default function UpdateRentingDialog(props: IRentingDialog) {
    const { chain } = useNetwork();
    const { address } = useAccount();

    const { setAlert } = useAlertContext();
    const { readContract, writeContract } = useContractContext();

    const { onClose, open, renting } = props;

    const [unitPrice, setUnitPrice] = useState<string>('');
    const [deposit, setDeposit] = useState<string>('');
    const [personCount, setPersonCount] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [tags, setTags] = useState<Array<string>>([]);
    const [description, setDescription] = useState<string>('');
    const [imageURL, setImageURL] = useState<string>('');

    const [loadingImage, setLoadingImage] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [availableTags, setAvailableTags] = useState<Array<string>>([]);

    useEffect(() => {
        setAvailableTags(['Maison', 'Appartement', 'Piscine', 'Montagne', 'Bord de mer']);
    }, []);

    useEffect(() => {
        if (Object.keys(renting).length) {
            setUnitPrice(ethers.utils.formatEther(renting.unitPrice));
            setDeposit(ethers.utils.formatEther(renting.deposit));
            setPersonCount(renting.personCount.toString());
            setLocation(renting.location);
            setDescription(renting.description);
            setTags(renting.tags);
            setImageURL(renting.imageURL);
        }
    }, [renting]);

    const handleClose = (data: IRenting | boolean) => {
        setUnitPrice('');
        setDeposit('');
        setPersonCount('');
        setLocation('');
        setTags([]);
        setDescription('');
        setImageURL('');
        onClose(data);
    };

    const isValidUnitPrice = () => {
        return /^\d{0,3}(\.\d{0,18})?$/.test(unitPrice);
    };

    const isValidDeposit = () => {
        return /^\d{0,3}(\.\d{0,18})?$/.test(deposit);
    };

    const isValidPersonCount = () => {
        return /^[0-9]{0,3}$/.test(personCount);
    };

    const handleTagClick = (event: any) => {
        if (tags.indexOf(event.target.innerText) === -1) {
            setTags([...tags, event.target.innerText]);
        } else {
            setTags(tags.filter((tag) => tag !== event.target.innerText));
        }
    };

    const handleChangeFile = async (e: any) => {
        setLoadingImage(true);
        var file = e.target.files[0];
        try {
            await unpinFileFromIPFS(imageURL.slice(21));
            const response = await uploadFileToIPFS(file, 'image_renting_' + renting.id.toNumber());
            if (response.success === true) {
                setImageURL(response.pinataURL);
            }
            setLoadingImage(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingImage(false);
            console.error('Error during file upload', e);
        }
    };

    const getColor = (tag: string) => {
        if (tags) {
            return tags.indexOf(tag) > -1 ? 'primary' : 'default';
        }
    };

    const canUpdate = () => {
        return (
            isValidUnitPrice() &&
            isValidDeposit() &&
            isValidPersonCount() &&
            location &&
            tags.length &&
            description &&
            imageURL
        );
    };

    const updateRenting = async () => {
        setLoadingUpdate(true);
        try {
            const transaction = await writeContract('SmartStayRenting', 'updateRenting', [
                renting.id.toNumber(),
                {
                    id: 0,
                    owner: ethers.constants.AddressZero,
                    unitPrice: ethers.utils.parseUnits(unitPrice, 'ether'),
                    deposit: ethers.utils.parseUnits(deposit, 'ether'),
                    personCount,
                    location,
                    tags,
                    description,
                    imageURL
                }
            ]);
            const receipt = await transaction.wait();

            setAlert({ message: 'Your renting has been successfully updated', severity: 'success' });

            setLoadingUpdate(false);
            handleClose(receipt.events[0].args['renting']);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            setLoadingUpdate(false);
            console.error(e);
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Update a renting</DialogTitle>
            <Stack spacing={2} justifyContent="center" alignItems="center">
                <Box>
                    <TextField
                        label="Night price (ETH)"
                        sx={{ width: '300px' }}
                        InputProps={{
                            inputProps: {
                                min: 0
                            },
                            endAdornment: <InputAdornment position="end">€</InputAdornment>
                        }}
                        value={unitPrice || ''}
                        error={!isValidUnitPrice()}
                        helperText={isValidUnitPrice() ? '' : 'Wrong format'}
                        onChange={(event) => {
                            setUnitPrice(event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Deposit (ETH)"
                        sx={{ width: '300px' }}
                        InputProps={{
                            inputProps: {
                                min: 0
                            },
                            endAdornment: <InputAdornment position="end">€</InputAdornment>
                        }}
                        value={deposit || ''}
                        error={!isValidDeposit()}
                        helperText={isValidDeposit() ? '' : 'Wrong format'}
                        onChange={(event) => {
                            setDeposit(event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        type="number"
                        label="Person count"
                        InputProps={{
                            inputProps: {
                                min: 0,
                                step: 1
                            }
                        }}
                        sx={{ width: '300px' }}
                        value={personCount || ''}
                        error={!isValidPersonCount()}
                        helperText={isValidPersonCount() ? '' : 'Wrong format'}
                        onChange={(event) => {
                            setPersonCount(event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Location"
                        sx={{ width: '300px' }}
                        value={location || ''}
                        onChange={(event) => {
                            setLocation(event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Description"
                        multiline
                        rows={3}
                        sx={{ width: '300px' }}
                        value={description || ''}
                        onChange={(event) => {
                            setDescription(event.target.value);
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: '300px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        borderRadius: '4px',
                        padding: '16.5px 14px'
                    }}
                >
                    <Typography>Tags</Typography>
                    {availableTags.map((availableTag) => (
                        <Chip
                            key={availableTag}
                            label={availableTag}
                            color={getColor(availableTag)}
                            onClick={handleTagClick}
                            sx={{ margin: '0.25rem' }}
                        />
                    ))}
                </Box>
                <Box
                    sx={{
                        width: '300px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        borderRadius: '4px',
                        padding: '16.5px 14px'
                    }}
                >
                    <Stack>
                        {imageURL ? (
                            <Box
                                display="flex"
                                justifyContent="center"
                                sx={{ marginBottom: '20px', height: '200px', position: 'relative' }}
                            >
                                <Image fill style={{ objectFit: 'contain' }} alt="Renting image" src={imageURL}></Image>
                            </Box>
                        ) : (
                            ''
                        )}

                        <LoadingButton loading={loadingImage} variant="contained" component="label">
                            Upload
                            <input hidden accept="image/*" type="file" onChange={handleChangeFile} />
                        </LoadingButton>
                    </Stack>
                </Box>
                <Box
                    sx={{
                        width: '300px'
                    }}
                >
                    <LoadingButton
                        loading={loadingUpdate}
                        sx={{ marginBottom: '1rem', width: '100%' }}
                        variant="contained"
                        onClick={updateRenting}
                        disabled={!canUpdate()}
                    >
                        Update
                    </LoadingButton>
                </Box>
            </Stack>
        </Dialog>
    );
}

UpdateRentingDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    renting: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired
};

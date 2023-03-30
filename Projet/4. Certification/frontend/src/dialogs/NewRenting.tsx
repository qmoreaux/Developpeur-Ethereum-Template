import { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

import { Dialog, DialogTitle, Chip, Stack, Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import { AttachMoney } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import { useAlertContext } from '@/context';

import { ethers, Event } from 'ethers';
import { useNetwork, useSigner, useProvider } from 'wagmi';

import { uploadFileToIPFS, updateFileName } from '../pinata';

import artifacts from '../../contracts/SmartStay.json';

import INetworks from '../interfaces/Networks';
import IRenting from '../interfaces/Renting';

interface IRentingDialog {
    open: boolean;
    onClose: (status: boolean | IRenting) => void;
}

export default function NewRentingDialog(props: IRentingDialog) {
    const { chain } = useNetwork();
    const provider = useProvider();
    const { data: signer } = useSigner();

    const { setAlert } = useAlertContext();

    const [unitPrice, setUnitPrice] = useState<string>('');
    const [deposit, setDeposit] = useState<string>('');
    const [personCount, setPersonCount] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [tags, setTags] = useState<Array<string>>([]);
    const [description, setDescription] = useState<string>('');
    const [imageURL, setImageURL] = useState<string>('');

    const [loadingImage, setLoadingImage] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);

    const [availableTags, setAvailableTags] = useState([]);

    const { onClose, open } = props;

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract(
                        (artifacts.networks as INetworks)[chain.id].address,
                        artifacts.abi,
                        provider
                    );
                    setAvailableTags(await contract.getTags());
                } catch (e) {
                    setAlert({
                        message: 'An error has occurred. Check the developer console for more information',
                        severity: 'error'
                    });
                    console.error(e);
                }
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain, provider]);

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
        var file = e.target.files[0];
        setLoadingImage(true);
        try {
            const response = await uploadFileToIPFS(file, 'image_renting_new');
            if (response.success === true) {
                setImageURL(response.pinataURL);
            }
            setLoadingImage(false);
        } catch (e) {
            setAlert({
                message: 'An error has occurred. Check the developer console for more information',
                severity: 'error'
            });
            console.error('Error during file upload', e);
            setLoadingImage(false);
        }
    };

    const getColor = (tag: string) => {
        return tags.indexOf(tag) > -1 ? 'primary' : 'default';
    };

    const canCreate = () => {
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

    const createRenting = async () => {
        if (signer && chain && chain.id) {
            try {
                setLoadingCreate(true);
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.createRenting({
                    id: 0,
                    owner: '0x0000000000000000000000000000000000000000',
                    unitPrice: ethers.utils.parseUnits(unitPrice.toString(), 'ether'),
                    deposit: ethers.utils.parseUnits(deposit.toString(), 'ether'),
                    personCount,
                    location,
                    tags,
                    description,
                    imageURL
                });
                const receipt = await transaction.wait();
                setAlert({ message: 'The renting was successfully created', severity: 'success' });
                setLoadingCreate(false);
                await updateFileName(
                    imageURL.slice(34),
                    'image_renting_' + receipt.events[0].args['renting'].id.toNumber()
                );
                handleClose(receipt.events[0].args['renting']);
            } catch (e) {
                setAlert({
                    message: 'An error has occurred. Check the developer console for more information',
                    severity: 'error'
                });
                setLoadingCreate(false);
                console.error(e);
            }
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Create a new renting</DialogTitle>
            <Stack spacing={2} justifyContent="center" alignItems="center">
                <Box>
                    <TextField
                        label="Night price (ETH)"
                        sx={{ width: '300px' }}
                        InputProps={{
                            inputProps: {
                                min: 0
                            },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <AttachMoney />
                                </InputAdornment>
                            )
                        }}
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
                            endAdornment: (
                                <InputAdornment position="end">
                                    <AttachMoney />
                                </InputAdornment>
                            )
                        }}
                        error={!isValidDeposit()}
                        helperText={isValidDeposit() ? '' : 'Wrong format'}
                        onChange={(event) => {
                            setDeposit(event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Person count"
                        sx={{ width: '300px' }}
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
                        loading={loadingCreate}
                        sx={{ marginBottom: '1rem', width: '100%' }}
                        variant="contained"
                        onClick={createRenting}
                        disabled={!canCreate()}
                    >
                        Create
                    </LoadingButton>
                </Box>
            </Stack>
        </Dialog>
    );
}

NewRentingDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

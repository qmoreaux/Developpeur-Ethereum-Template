import { useState, useEffect } from 'react';
import Image from 'next/image';

import { uploadFileToIPFS } from '../pinata';

import PropTypes from 'prop-types';

import { Dialog, DialogTitle, Chip, Stack, Box, Typography, TextField, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ethers } from 'ethers';
import { useNetwork, useProvider, useSigner } from 'wagmi';

import artifacts from '../../contracts/SmartStay.json';

import INetworks from '../interfaces/Networks';
import IRenting from '../interfaces/Renting';

export default function UpdateRentingDialog(props: any) {
    const { chain } = useNetwork();
    const { data: signer } = useSigner();
    const provider = useProvider();

    const { onClose, open, data } = props;

    const [unitPrice, setUnitPrice] = useState<number>(0);
    const [caution, setCaution] = useState<number>(0);
    const [personCount, setPersonCount] = useState<number>(0);
    const [location, setLocation] = useState<string>('');
    const [tags, setTags] = useState<Array<string>>([]);
    const [description, setDescription] = useState<string>('');
    const [imageURL, setImageURL] = useState<string>('');

    const [loadingImage, setLoadingImage] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [availableTags, setAvailableTags] = useState([]);

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
                    console.error(e);
                }
            }
        })();
    }, [provider, chain]);

    useEffect(() => {
        if (Object.keys(data).length) {
            setUnitPrice(+ethers.utils.formatEther(data.unitPrice));
            setCaution(+ethers.utils.formatEther(data.caution));
            setPersonCount(data.personCount);
            setLocation(data.location);
            setDescription(data.description);
            setTags(data.tags);
            setImageURL(data.imageURL);
        }
    }, [data]);

    const handleClose = (data: IRenting | boolean) => {
        setUnitPrice(0);
        setCaution(0);
        setPersonCount(0);
        setLocation('');
        setTags([]);
        setDescription('');
        setImageURL('');
        onClose(data);
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
            const response = await uploadFileToIPFS(file);
            if (response.success === true) {
                setImageURL(response.pinataURL);
            }
            setLoadingImage(false);
        } catch (e) {
            console.error('Error during file upload', e);
            setLoadingImage(false);
        }
    };

    const getColor = (tag: string) => {
        if (tags) {
            return tags.indexOf(tag) > -1 ? 'primary' : 'default';
        }
    };

    const canUpdate = () => {
        return unitPrice && personCount && location && tags.length && description && imageURL;
    };

    const updateRenting = async () => {
        if (signer && chain && chain.id) {
            setLoadingUpdate(true);
            try {
                const contract = new ethers.Contract(
                    (artifacts.networks as INetworks)[chain.id].address,
                    artifacts.abi,
                    signer
                );
                const transaction = await contract.updateRenting(data.id, {
                    id: 0,
                    owner: '0x0000000000000000000000000000000000000000',
                    unitPrice: ethers.utils.parseUnits(unitPrice.toFixed(), 'ether'),
                    caution: ethers.utils.parseUnits(caution.toFixed(), 'ether'),
                    personCount,
                    location,
                    tags,
                    description,
                    imageURL
                });
                const receipt = await transaction.wait();
                setLoadingUpdate(false);
                handleClose(receipt.events[0].args['renting']);
            } catch (e) {
                console.error(e);
                setLoadingUpdate(false);
            }
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Update a renting</DialogTitle>
            <Stack spacing={2} justifyContent="center" alignItems="center">
                <Box>
                    <TextField
                        label="Night price (ETH)"
                        type="number"
                        sx={{ width: '300px' }}
                        InputProps={{
                            inputProps: {
                                min: 0
                            },
                            endAdornment: <InputAdornment position="end">€</InputAdornment>
                        }}
                        value={unitPrice || 0}
                        onChange={(event) => {
                            setUnitPrice(+event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Caution (ETH)"
                        type="number"
                        sx={{ width: '300px' }}
                        InputProps={{
                            inputProps: {
                                min: 0
                            },
                            endAdornment: <InputAdornment position="end">€</InputAdornment>
                        }}
                        value={caution || 0}
                        onChange={(event) => {
                            setCaution(+event.target.value);
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
                        value={personCount || 0}
                        onChange={(event) => {
                            setPersonCount(+event.target.value);
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
    data: PropTypes.any.isRequired
};

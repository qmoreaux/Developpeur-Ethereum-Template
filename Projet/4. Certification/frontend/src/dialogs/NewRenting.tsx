import { ChangeEvent, useState, useEffect } from "react";

import PropTypes from "prop-types";

import { Dialog, DialogTitle, Chip, Stack, Box, Typography, Button, TextField, InputAdornment } from "@mui/material";
import { ethers } from "ethers";
import { useNetwork, useSigner, useProvider, useAccount } from "wagmi";

import { networks, abi } from "../../contracts/SmartStay.json";

import INetworks from "../interfaces/Networks";
import IRenting from "../interfaces/Renting";
import { AttachMoney } from "@mui/icons-material";

export default function NewRentingDialog(props: any) {
    const { chain } = useNetwork();
    const provider = useProvider();
    const { data: signer } = useSigner();

    const [unitPrice, setUnitPrice] = useState(0);
    const [caution, setCaution] = useState(0);
    const [personCount, setPersonCount] = useState(0);
    const [location, setLocation] = useState("");
    const [tags, setTags] = useState<Array<string>>([]);
    const [description, setDescription] = useState("");

    const [availableTags, setAvailableTags] = useState([]);

    const [filename, setFilename] = useState("");
    const [file, setFile] = useState({});

    const { onClose, open } = props;

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, provider);
                    setAvailableTags(await contract.getTags());
                } catch (e) {
                    console.error(e);
                }
            }
        })();
    }, []);

    const handleClose = (data: IRenting | boolean) => {
        onClose(data);
    };

    const handleTagClick = (event: any) => {
        if (tags.indexOf(event.target.innerText) === -1) {
            setTags([...tags, event.target.innerText]);
        } else {
            setTags(tags.filter((tag) => tag !== event.target.innerText));
        }
    };

    const getColor = (tag: string) => {
        return tags.indexOf(tag) > -1 ? "primary" : "default";
    };

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) {
            return;
        }
        const file = event.target.files[0];
        const { name } = file;
        setFilename(name);
        setFile(file);
    };

    const canCreate = () => {
        return unitPrice && caution && personCount && location && tags.length && description;
    };

    const createRenting = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as INetworks)[chain.id].address, abi, signer);
                const transaction = await contract.createRenting({
                    id: 0,
                    owner: "0x0000000000000000000000000000000000000000",
                    unitPrice: ethers.utils.parseUnits(unitPrice.toString(), "ether"),
                    caution: ethers.utils.parseUnits(caution.toString(), "ether"),
                    personCount,
                    location,
                    tags,
                    description,
                    imageURL:
                        "https://gateway.pinata.cloud/ipfs/Qmb3nGrbsx5b5uFggrDuxTAGdE9dwnzg2i4duJCcJwSzzr?_gl=1*1f1pqix*_ga*MmIzMjNlOWMtZjM2Zi00MDhhLWEwZjctNGFjNTNkNjliOTUw*_ga_5RMPXG14TE*MTY3OTc1NjYyNC44LjEuMTY3OTc1NjYyNy41Ny4wLjA."
                });
                const receipt = await transaction.wait();
                handleClose(receipt.events[0].args["renting"]);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={"sm"} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Create a new renting</DialogTitle>
            <Stack spacing={2} justifyContent="center" alignItems="center">
                <Box>
                    <TextField
                        label="Night price (ETH)"
                        type="number"
                        sx={{ width: "300px" }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <AttachMoney />
                                </InputAdornment>
                            )
                        }}
                        onChange={(event) => {
                            setUnitPrice(+event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Caution (ETH)"
                        type="number"
                        sx={{ width: "300px" }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <AttachMoney />
                                </InputAdornment>
                            )
                        }}
                        onChange={(event) => {
                            setCaution(+event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        type="number"
                        label="Person count"
                        sx={{ width: "300px" }}
                        onChange={(event) => {
                            setPersonCount(+event.target.value);
                        }}
                    />
                </Box>
                <Box>
                    <TextField
                        label="Location"
                        sx={{ width: "300px" }}
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
                        sx={{ width: "300px" }}
                        onChange={(event) => {
                            setDescription(event.target.value);
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: "300px",
                        border: "1px solid rgba(0, 0, 0, 0.23)",
                        borderRadius: "4px",
                        padding: "16.5px 14px"
                    }}
                >
                    <Typography>Tags</Typography>
                    {availableTags.map((availableTag) => (
                        <Chip
                            key={availableTag}
                            label={availableTag}
                            color={getColor(availableTag)}
                            onClick={handleTagClick}
                            sx={{ margin: "0.25rem" }}
                        />
                    ))}
                </Box>
                <Box>
                    <Button variant="contained" component="label">
                        Upload
                        <input hidden accept="image/*" type="file" onChange={handleFileUpload} />
                    </Button>
                    {filename ? <Typography>{filename}</Typography> : ""}
                </Box>
                <Box
                    sx={{
                        width: "300px"
                    }}
                >
                    <Button
                        sx={{ marginBottom: "1rem", width: "100%" }}
                        variant="contained"
                        onClick={createRenting}
                        disabled={!canCreate()}
                    >
                        Create
                    </Button>
                </Box>
            </Stack>
        </Dialog>
    );
}

NewRentingDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

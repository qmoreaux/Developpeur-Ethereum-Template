import { ChangeEvent, useState, useEffect } from "react";

import PropTypes from "prop-types";

import { Dialog, DialogTitle, Box, Grid, Typography, Button, TextField, InputAdornment } from "@mui/material";
import { ethers } from "ethers";
import { useNetwork, useSigner } from "wagmi";

import { networks, abi } from "../../contracts/SmartStay.json";

import Networks from "../interfaces/Networks";
import Renting from "../interfaces/Renting";

const emails = ["username@gmail.com", "user02@gmail.com"];

export default function UpdateRentingDialog(props: any) {
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const { onClose, open, data } = props;

    const [nightPrice, setNightPrice] = useState(0);
    const [personCount, setPersonCount] = useState(0);
    const [location, setLocation] = useState("");
    const [tags, setTags] = useState([]);
    const [description, setDescription] = useState("");

    const [filename, setFilename] = useState("");
    const [file, setFile] = useState({});

    useEffect(() => {
        if (data) {
            setNightPrice(data.unitPrice);
            setPersonCount(data.personCount);
            setLocation(data.location);
            setDescription(data.description);
        }
    }, [data]);

    const handleClose = (data: Renting | boolean) => {
        onClose(data);
    };

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) {
            return;
        }
        const file = event.target.files[0];
        const { name } = file;
        setFilename(name);
        setFile(file);
        console.log(file);
    };

    const updateRenting = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, signer);
                const transaction = await contract.updateRenting(
                    data.index,
                    nightPrice,
                    personCount,
                    location,
                    ["Grand", "France2"],
                    description,
                    "https://gateway.pinata.cloud/ipfs/Qmb3nGrbsx5b5uFggrDuxTAGdE9dwnzg2i4duJCcJwSzzr?_gl=1*1f1pqix*_ga*MmIzMjNlOWMtZjM2Zi00MDhhLWEwZjctNGFjNTNkNjliOTUw*_ga_5RMPXG14TE*MTY3OTc1NjYyNC44LjEuMTY3OTc1NjYyNy41Ny4wLjA."
                );
                const receipt = await transaction.wait();
                handleClose(receipt.events[0].args["_renting"]);
            } catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={"sm"} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Update a renting</DialogTitle>
            <Grid container flexDirection="column" justifyContent="center" alignItems="center">
                <Grid item>
                    <TextField
                        label="Night price"
                        variant="standard"
                        type="number"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">€</InputAdornment>
                        }}
                        value={nightPrice || 0}
                        onChange={(event) => {
                            setNightPrice(+event.target.value);
                        }}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        type="number"
                        label="Person count"
                        variant="standard"
                        value={personCount || 0}
                        onChange={(event) => {
                            setPersonCount(+event.target.value);
                        }}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label="Location"
                        variant="standard"
                        value={location || ""}
                        onChange={(event) => {
                            setLocation(event.target.value);
                        }}
                    />
                </Grid>
                <Grid item>
                    <TextField label="Tags" variant="standard" />
                </Grid>
                <Grid item>
                    <TextField
                        label="Description"
                        variant="standard"
                        value={description || ""}
                        onChange={(event) => {
                            setDescription(event.target.value);
                        }}
                    />
                </Grid>
                <Grid item>
                    <Button variant="contained" component="label">
                        Upload
                        <input hidden accept="image/*" type="file" onChange={handleFileUpload} />
                    </Button>
                    {filename ? <Typography>{filename}</Typography> : ""}
                </Grid>
                <Grid item>
                    <Button variant="contained" onClick={updateRenting}>
                        Update
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}

UpdateRentingDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    data: PropTypes.any.isRequired
};

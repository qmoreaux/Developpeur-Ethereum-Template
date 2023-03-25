import { ChangeEvent, useState } from "react";

import PropTypes from "prop-types";

import { Dialog, DialogTitle, Box, Grid, Typography, Button, TextField, InputAdornment } from "@mui/material";
import { ethers } from "ethers";
import { useNetwork, useSigner } from "wagmi";

import { networks, abi } from "../../contracts/SmartStay.json";

import Networks from "../interfaces/Networks";
import Renting from "../interfaces/Renting";

const emails = ["username@gmail.com", "user02@gmail.com"];

export default function NewRentingDialog(props: any) {
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const [nightPrice, setNightPrice] = useState(0);
    const [personCount, setPersonCount] = useState(0);
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");

    const [filename, setFilename] = useState("");
    const [file, setFile] = useState({});

    const { onClose, open } = props;

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
    };

    const createRenting = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, signer);
                const transaction = await contract.createRenting(
                    nightPrice,
                    personCount,
                    location,
                    ["Grand", "France"],
                    description,
                    "https://gateway.pinata.cloud/ipfs/Qmb3nGrbsx5b5uFggrDuxTAGdE9dwnzg2i4duJCcJwSzzr?_gl=1*1f1pqix*_ga*MmIzMjNlOWMtZjM2Zi00MDhhLWEwZjctNGFjNTNkNjliOTUw*_ga_5RMPXG14TE*MTY3OTc1NjYyNC44LjEuMTY3OTc1NjYyNy41Ny4wLjA."
                );
                const receipt = await transaction.wait();
                handleClose(receipt.events[0].args["_renting"]);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={"sm"} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Create a new renting</DialogTitle>
            <Grid container flexDirection="column" justifyContent="center" alignItems="center">
                <Grid item>
                    <TextField
                        label="Night price"
                        variant="standard"
                        type="number"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">€</InputAdornment>
                        }}
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
                        onChange={(event) => {
                            setPersonCount(+event.target.value);
                        }}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label="Location"
                        variant="standard"
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
                    <Button variant="contained" onClick={createRenting}>
                        Create
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}

NewRentingDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

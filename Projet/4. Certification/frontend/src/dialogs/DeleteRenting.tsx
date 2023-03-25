import PropTypes from "prop-types";

import { ethers } from "ethers";
import { useNetwork, useSigner } from "wagmi";
import { Dialog, DialogTitle, Box, Typography, Button } from "@mui/material";

import { networks, abi } from "../../contracts/SmartStay.json";

import Networks from "../interfaces/Networks";

export default function DeleteRentingDialog(props: any) {
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const { onClose, index, open } = props;

    const handleClose = (status: boolean) => {
        onClose(status);
    };

    const deleteRenting = async () => {
        if (signer && chain && chain.id) {
            try {
                const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, signer);
                const transaction = await contract.deleteRenting(index);
                await transaction.wait();
                handleClose(true);
            } catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth={"sm"} onClose={() => handleClose(false)} open={open}>
            <DialogTitle textAlign="center">Delete a renting</DialogTitle>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                <Typography>Are you sure you want to delete this renting ?</Typography>
                <Box m="1rem" width="80%" display="flex" justifyContent="space-evenly">
                    <Button variant="contained" onClick={deleteRenting}>
                        Confirm
                    </Button>
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
    index: PropTypes.number.isRequired
};

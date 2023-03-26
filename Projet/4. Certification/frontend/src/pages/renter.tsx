import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Head from "next/head";
import Layout from "@/components/Layout/Layout";
import NewRentingDialog from "@/dialogs/NewRenting";
import UpdateRentingDialog from "@/dialogs/UpdateRenting";
import DeleteRentingDialog from "@/dialogs/DeleteRenting";

import { ethers } from "ethers";
import { useNetwork, useProvider, useAccount } from "wagmi";
import { Button, Typography, Box, Card, CardContent, CardMedia } from "@mui/material";
import { Add, Update, Delete } from "@mui/icons-material";

import { networks, abi } from "../../contracts/SmartStay.json";

import Renting from "../interfaces/Renting";
import Networks from "../interfaces/Networks";

export default function Renter() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const provider = useProvider();
    const router = useRouter();

    const [userRentings, setUserRentings] = useState<Array<Renting>>([]);
    const [open, setOpen] = useState({ NewRenting: false, UpdateRenting: false, DeleteRenting: false });
    const [updateRenting, setUpdateRenting] = useState({});
    const [deleteRenting, setDeleteRenting] = useState<number>(0);

    useEffect(() => {
        (async () => {
            if (provider && chain && chain.id) {
                try {
                    const contract = new ethers.Contract((networks as Networks)[chain.id].address, abi, provider);
                    setUserRentings(await contract.getUserRenting({ from: address }));
                } catch (e) {
                    console.error(e);
                }
            }
        })();
    }, [address]);

    useEffect(() => {
        if (!isConnected) {
            router.push("/");
        }
    }, []);

    const handleClickOpen = (dialog: any, data?: any) => {
        setOpen({ ...open, [dialog]: true });
        switch (dialog) {
            case "UpdateRenting": {
                setUpdateRenting(data);
                break;
            }
            case "DeleteRenting": {
                setDeleteRenting(data);
                break;
            }
        }
    };

    const handleClose = (dialog: any, data: any) => {
        setOpen({ ...open, [dialog]: false });

        switch (dialog) {
            case "NewRenting": {
                if (data) {
                    setUserRentings([...userRentings, data]);
                }
                break;
            }
            case "UpdateRenting": {
                if (data) {
                    setUserRentings(
                        userRentings.map((userRenting) => {
                            if (userRenting.index.toNumber() === data.index.toNumber()) {
                                return data;
                            }
                            return userRenting;
                        })
                    );
                }
                setUpdateRenting({});
                break;
            }
            case "DeleteRenting": {
                if (data) {
                    setUserRentings(
                        userRentings.filter((userRenting: Renting) => {
                            if (userRenting.index.toNumber() === deleteRenting) {
                                return false;
                            }
                            return true;
                        })
                    );
                }
                setDeleteRenting(0);
                break;
            }
        }
    };

    return (
        <>
            <Head>
                <title>SmartStay: Renter</title>
                <meta name="description" content="SmartStay project for Alyra certification" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                <Box width="80%" flexGrow="1" position="relative">
                    <Typography variant="h4" textAlign={"center"} m="2rem">
                        My proposed rentings
                    </Typography>
                    <Box display="flex" justifyContent={"space-evenly"}>
                        {userRentings.map((userRenting: Renting) => (
                            <Card
                                key={userRenting.index.toNumber()}
                                sx={{
                                    backgroundColor: "whitesmoke",
                                    width: "400px",
                                    boxShadow: "0 0 4px rgba(0, 0, 0, 0.3)"
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200px"
                                    image={userRenting.imageURL}
                                    alt="Image rental"
                                    sx={{ backgroundColor: "white", objectFit: "contain" }}
                                ></CardMedia>
                                <CardContent>
                                    <Typography>Renting ID : #{userRenting.index.toNumber()}</Typography>
                                    <Typography>Night price : {userRenting.unitPrice}</Typography>
                                    <Typography>Maximum persons: {userRenting.personCount}</Typography>
                                    <Typography>Location : {userRenting.location}</Typography>
                                    <Typography>Tags : {userRenting.tags.join(", ")}</Typography>
                                    <Typography>Description : {userRenting.description}</Typography>
                                    <Box display="flex" justifyContent="space-between" mt="1rem">
                                        <Button
                                            variant="contained"
                                            color="warning"
                                            onClick={() => handleClickOpen("UpdateRenting", userRenting)}
                                            startIcon={<Update />}
                                        >
                                            <Typography>Update</Typography>
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() =>
                                                handleClickOpen("DeleteRenting", userRenting.index.toNumber())
                                            }
                                            startIcon={<Delete />}
                                        >
                                            <Typography>Delete</Typography>
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                    <Button
                        color="error"
                        variant="contained"
                        sx={{
                            position: "absolute",
                            bottom: "2rem",
                            right: "2rem",
                            minWidth: "50px",
                            height: "50px",
                            borderRadius: "50px",
                            padding: "0"
                        }}
                        onClick={() => handleClickOpen("NewRenting")}
                    >
                        <Add sx={{ fontSize: 35 }}></Add>
                    </Button>
                </Box>
                <NewRentingDialog open={open.NewRenting} onClose={(status) => handleClose("NewRenting", status)} />
                <UpdateRentingDialog
                    open={open.UpdateRenting}
                    data={updateRenting}
                    onClose={(status) => handleClose("UpdateRenting", status)}
                />
                <DeleteRentingDialog
                    open={open.DeleteRenting}
                    index={deleteRenting}
                    onClose={(status) => handleClose("DeleteRenting", status)}
                />
            </Layout>
        </>
    );
}

import { Box, Container, Typography } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const Header = () => {
    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            height="10vh"
            width="100%"
            padding="2rem"
            sx={{ backgroundColor: "whitesmoke" }}
        >
            <Typography fontWeight="bold">Logo</Typography>
            <Box width="30%" display="flex" justifyContent="space-between" alignItems="center">
                <Typography>
                    <Link href="/">Home</Link>
                </Typography>
                <Typography>
                    <Link href="/renting">Renting</Link>
                </Typography>
                <Typography>
                    <Link href="/renter">Renter</Link>
                </Typography>
            </Box>
            <ConnectButton />
        </Box>
    );
};

export default Header;

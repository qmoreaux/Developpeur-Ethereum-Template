import { Box, Container, Typography } from '@mui/material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const Header = () => {
    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            height="10vh"
            width="100%"
            padding="2rem"
            sx={{ backgroundColor: 'whitesmoke' }}
        >
            <Typography fontWeight="bold" width="30%">
                Logo
            </Typography>
            <Box width="25%" display="flex" justifyContent="space-between" alignItems="center">
                <Typography>
                    <Link href="/">Home</Link>
                </Typography>
                <Typography>
                    <Link href="/renting">Renting</Link>
                </Typography>
                <Typography>
                    <Link href="/renter">Renter</Link>
                </Typography>
                <Typography>
                    <Link href="/booking">Booking</Link>
                </Typography>
            </Box>
            <Box width="30%" display="flex" justifyContent="flex-end">
                <ConnectButton />
            </Box>
        </Box>
    );
};

export default Header;

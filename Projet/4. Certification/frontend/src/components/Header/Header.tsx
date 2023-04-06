import { Box, Container, Typography } from '@mui/material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

import { useAccount } from 'wagmi';

const Header = () => {
    const { isConnected } = useAccount();

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            height="10vh"
            width="100%"
            padding="1rem 2rem"
            boxShadow={'0px 5px 5px 0px rgba(0, 0, 0, 0.25)'}
            position={'relative'}
            sx={{ backgroundColor: 'whitesmoke' }}
        >
            <Typography fontWeight="bold" width="30%">
                Logo
            </Typography>
            <Box width="25%" display="flex" justifyContent="space-between" alignItems="center">
                {isConnected ? (
                    <>
                        <Typography>
                            <Link href="/">Renting</Link>
                        </Typography>
                        <Typography>
                            <Link href="/renter">Renter</Link>
                        </Typography>
                        <Typography>
                            <Link href="/booking">Booking</Link>
                        </Typography>
                        <Typography>
                            <Link href="/profile">Profile</Link>
                        </Typography>
                    </>
                ) : (
                    ''
                )}
            </Box>
            <Box width="30%" display="flex" justifyContent="flex-end">
                <ConnectButton />
            </Box>
        </Box>
    );
};

export default Header;

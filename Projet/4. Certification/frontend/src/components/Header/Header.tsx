import { Box, Container, Typography } from '@mui/material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';

import { useState, useEffect } from 'react';

import { useAccount } from 'wagmi';

const Header = () => {
    const { isConnected } = useAccount();
    const [_isConnected, _setIsConnected] = useState(false);

    useEffect(() => {
        _setIsConnected(isConnected);
    }, [isConnected]);

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
            <Box width="30%">
                <Image src="/../public/SmartStay.png" alt="Logo" width={60} height={60}></Image>
            </Box>
            <Box width="25%" display="flex" justifyContent="space-between" alignItems="center">
                {_isConnected ? (
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
                        <Typography>
                            <Link href="/marketplace">Marketplace</Link>
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

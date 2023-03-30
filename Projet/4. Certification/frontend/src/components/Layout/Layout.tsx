import { Box } from '@mui/material';

import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import AlertComponent from '../Alert/Alert';

import ILayout from '@/interfaces/Layout';

const Layout = ({ children }: ILayout) => {
    return (
        <Box
            height="100vh"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection="column"
            sx={{ backgroundColor: 'white' }}
        >
            <Header />
            <AlertComponent />
            {children}
            <Footer />
        </Box>
    );
};

export default Layout;

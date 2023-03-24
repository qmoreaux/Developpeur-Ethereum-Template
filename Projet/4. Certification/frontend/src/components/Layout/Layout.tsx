import { Box } from '@mui/material';

import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Layout = ({ children }: any) => {
    return (
        <Box height="100vh" display="flex" justifyContent="space-between" alignItems="center" flexDirection="column">
            <Header />
            {children}
            <Footer />
        </Box>
    );
};

export default Layout;

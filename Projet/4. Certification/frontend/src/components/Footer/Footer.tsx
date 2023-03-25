import { Box, Typography } from "@mui/material";

const Footer = () => {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="10vh"
            p="2rem"
            sx={{ backgroundColor: "whitesmoke" }}
        >
            <Typography>&copy; Quentin MOREAUX {new Date().getFullYear()}</Typography>
        </Box>
    );
};

export default Footer;

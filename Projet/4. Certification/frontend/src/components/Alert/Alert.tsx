import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

import { useAlertContext } from '@/context';

const AlertComponent = () => {
    const { alert } = useAlertContext();

    const [open, setOpen] = useState(false);

    useEffect(() => {
        console.log(alert);
    }, [alert]);

    const handleClose = (event: React.SyntheticEvent<any> | Event, reason: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    useEffect(() => {
        setOpen(true);
    }, [alert]);

    return (
        <>
            {alert ? (
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={open}
                    key={alert.message}
                    message={alert.message}
                    autoHideDuration={4000}
                    onClose={handleClose}
                >
                    <Alert severity={alert.severity}>{alert.message}</Alert>
                </Snackbar>
            ) : (
                ''
            )}
        </>
    );
};

export default AlertComponent;

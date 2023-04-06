import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

import { useAlertContext } from '@/context';
import { IAlert } from '@/interfaces/Alert';

const AlertComponent = () => {
    const { alert, setAlert } = useAlertContext();

    const [open, setOpen] = useState(false);

    const handleClose = (event: React.SyntheticEvent<any> | Event, reason: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlert({} as IAlert);
        setOpen(false);
    };

    useEffect(() => {
        setOpen(true);
    }, [alert]);

    return (
        <>
            {alert.message ? (
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

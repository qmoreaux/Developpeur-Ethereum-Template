import { AlertColor } from '@mui/material';

export interface IAlert {
    message: string;
    severity: AlertColor;
}

export interface IAlertContextProps {
    alert: IAlert;
    setAlert: (alert: IAlert) => void;
}

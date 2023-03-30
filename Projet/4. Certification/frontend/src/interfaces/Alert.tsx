export interface IAlert {
    message: string;
    severity: string;
}

export interface IAlertContextProps {
    alert: IAlert;
    setAlert: (alert: IAlert) => void;
}

export interface IAlert {
    message: string;
    severity: string;
}

export interface IAlertContextProps {
    alert: any;
    setAlert: (alert: any) => void;
}

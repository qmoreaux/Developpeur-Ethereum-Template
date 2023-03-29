import React, { ReactNode, useState } from 'react';

interface IAlertContextProps {
    alert: any;
    setAlert: (alert: any) => void;
}

interface Props {
    children: ReactNode;
}

export const AlertContext = React.createContext<IAlertContextProps>({
    alert: {},
    setAlert: () => {}
});

export const AlertContextProvider = ({ children }: Props) => {
    const [currentAlert, setCurrentAlert] = useState(undefined);

    return (
        <AlertContext.Provider
            value={{
                alert: currentAlert,
                setAlert: setCurrentAlert
            }}
        >
            {children}
        </AlertContext.Provider>
    );
};

import React, { useState } from 'react';

import ILayout from '@/interfaces/Layout';
import { IAlert, IAlertContextProps } from '@/interfaces/Alert';

export const AlertContext = React.createContext<IAlertContextProps>({
    alert: {} as IAlert,
    setAlert: () => {}
});

export const AlertContextProvider = ({ children }: ILayout) => {
    const [currentAlert, setCurrentAlert] = useState({} as IAlert);

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

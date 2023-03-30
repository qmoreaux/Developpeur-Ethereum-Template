import React, { useState } from 'react';

import ILayout from '@/interfaces/Layout';
import { IAlertContextProps } from '@/interfaces/Alert';

export const AlertContext = React.createContext<IAlertContextProps>({
    alert: {},
    setAlert: () => {}
});

export const AlertContextProvider = ({ children }: ILayout) => {
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

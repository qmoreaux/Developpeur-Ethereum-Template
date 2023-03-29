import { useContext } from 'react';

import { AlertContext } from './alert';

export const useAlertContext = () => useContext(AlertContext);
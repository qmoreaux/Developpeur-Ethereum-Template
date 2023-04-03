import { useContext } from 'react';

import { AlertContext } from './alert';
import { ContractContext } from './contract';

export const useAlertContext = () => useContext(AlertContext);
export const useContractContext = () => useContext(ContractContext);

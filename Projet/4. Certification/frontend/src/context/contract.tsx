import React, { useState } from 'react';

import { useNetwork, useProvider, useAccount, useSigner } from 'wagmi';
import { ethers } from 'ethers';

import artifacts from '../../contracts/SmartStay.json';

import ILayout from '@/interfaces/Layout';
import INetworks from '@/interfaces/Networks';

import { IContractContextProps } from '@/interfaces/Contract';

export const ContractContext = React.createContext<IContractContextProps>({
    readContract: () => {},
    writeContract: () => {}
});

export const ContractContextProvider = ({ children }: ILayout) => {
    const { address } = useAccount();
    const { chain } = useNetwork();

    const provider = useProvider();
    const { data: signer } = useSigner();

    const _readContract = async (functionName: string, params: Array<any>) => {
        let chainId = chain?.id || 1337;

        const contract = new ethers.Contract(
            (artifacts.networks as INetworks)[chainId].address,
            artifacts.abi,
            provider
        );

        return contract[functionName](...params);
    };

    const _writeContract = async (functionName: string, params: Array<any>) => {
        let chainId = chain?.id || 1337;

        if (signer) {
            const contract = new ethers.Contract(
                (artifacts.networks as INetworks)[chainId].address,
                artifacts.abi,
                signer
            );

            return contract[functionName](...params);
        }
    };

    return (
        <ContractContext.Provider
            value={{
                readContract: _readContract,
                writeContract: _writeContract
            }}
        >
            {children}
        </ContractContext.Provider>
    );
};

import React, { useState } from 'react';

import { useNetwork, useProvider, useAccount, useSigner } from 'wagmi';
import { ethers } from 'ethers';

import artifacts from '../../contracts/SmartStay.json';

import ILayout from '@/interfaces/Layout';
import IArtifacts from '@/interfaces/Artifacts';

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

    const _readContract = async (contractName: string, functionName: string, params: Array<any>) => {
        let chainId = chain?.id || 1337;

        const contract = new ethers.Contract(
            (artifacts as IArtifacts)[contractName].networks[chainId].address,
            (artifacts as IArtifacts)[contractName].abi,
            provider
        );

        return contract[functionName](...params);
    };

    const _writeContract = async (contractName: string, functionName: string, params: Array<any>) => {
        let chainId = chain?.id || 1337;

        if (signer) {
            const contract = new ethers.Contract(
                (artifacts as IArtifacts)[contractName].networks[chainId].address,
                (artifacts as IArtifacts)[contractName].abi,
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

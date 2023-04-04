export interface IContractContextProps {
    readContract: (contractName: string, functionName: string, params: Array<any>) => any;
    writeContract: (contractName: string, functionName: string, params: Array<any>) => any;
}

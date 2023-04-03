export interface IContractContextProps {
    readContract: (functionName: string, params: Array<any>) => any;
    writeContract: (functionName: string, params: Array<any>) => any;
}

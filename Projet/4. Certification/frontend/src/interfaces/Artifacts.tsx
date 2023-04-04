export default interface IArtifacts {
    [key: string]: {
        abi: any;
        networks: {
            [key: string]: any;
        };
    };
}

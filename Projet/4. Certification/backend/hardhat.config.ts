import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

require('dotenv').config();

const config: HardhatUserConfig = {
    defaultNetwork: 'localhost',
    networks: {
        localhost: {
            url: 'http://127.0.0.1:8545',
            chainId: 31337
        },
        goerli: {
            url: `https://goerli.infura.io/v3/${process.env.INFURA_ID}`,
            accounts: {
                mnemonic: `${process.env.MNEMONIC}`,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20
            },
            chainId: 5
        },
        sepolia: {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_ID}`,
            accounts: {
                mnemonic: `${process.env.MNEMONIC}`,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20
            },
            chainId: 11155111
        },
        mumbai: {
            url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`,
            accounts: {
                mnemonic: `${process.env.MNEMONIC}`,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20
            },
            chainId: 80001
        }
    },
    solidity: '0.8.19'
};

export default config;
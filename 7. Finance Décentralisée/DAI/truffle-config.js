const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
    networks: {
        development: {
            host: '127.0.0.1', // Localhost (default: none)
            port: 8545, // Standard Ethereum port (default: none)
            network_id: '*' // Any network (default: none)
        },
        goerli: {
            provider: function () {
                return new HDWalletProvider({
                    mnemonic: { phrase: `${process.env.MNEMONIC}` },
                    providerOrUrl: `https://goerli.infura.io/v3/${process.env.INFURA_ID}`
                });
            },
            network_id: 5
        }
    },
    mocha: {},
    compilers: {
        solc: {
            version: '0.8.19', // Fetch exact version from solc-bin (default: truffle's version)
            settings: {
                optimizer: {
                    enabled: false,
                    runs: 200
                }
            }
        }
    }
};

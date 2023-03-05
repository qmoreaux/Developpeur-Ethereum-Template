const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
    networks: {
        development: {
            host: '127.0.0.1', // Localhost (default: none)
            port: 8545, // Standard Ethereum port (default: none)
            network_id: '*' // Any network (default: none)
        },
    },
    mocha: {
        reporter: 'eth-gas-reporter',
        reporterOptions: {
            gasPrice: 1,
            token: 'ETH',
            showTimeSpent: true
        }
    },
    compilers: {
        solc: {
            version: '0.8.18', // Fetch exact version from solc-bin (default: truffle's version)
            settings: {
                optimizer: {
                    enabled: false,
                    runs: 200
                }
            }
        }
    }
};

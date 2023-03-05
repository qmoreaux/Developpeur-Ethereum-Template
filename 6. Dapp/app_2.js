const Web3 = require('web3');
const rpcUrl = 'https://goerli.infura.io/v3/c17d40c85c2043a59aaa93a626d0c90a';

const web3 = new Web3(rpcUrl);

const ABI = [
    {
        inputs: [{ internalType: 'uint256', name: 'x', type: 'uint256' }],
        name: 'set',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'get',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
        constant: true
    }
];
const SSaddress = '0xfA95935932ECcd000765C772CF8A731B1E215d06';
const simpleStorage = new web3.eth.Contract(ABI, SSaddress);
simpleStorage.methods.get().call((err, data) => {
    console.log(data);
});

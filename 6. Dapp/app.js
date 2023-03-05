const Web3 = require('web3');
const rpcUrl = 'https://goerli.infura.io/v3/c17d40c85c2043a59aaa93a626d0c90a';

const web3 = new Web3(rpcUrl);

web3.eth.getBalance('0x8D5067C9635c61A7f485C55C7615F137cd842996', (err, balance) => {
    console.log(web3.utils.fromWei(balance, 'ether'));
});

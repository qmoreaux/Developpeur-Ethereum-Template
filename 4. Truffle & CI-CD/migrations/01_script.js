const SimpleStorage = artifacts.require('SimpleStorage');

module.exports = async (deployer, networks, accounts) => {
    const value = 20;
    const ethToSend = 1000000000000000000;
    const deployMethod = 1;
    if (accounts) {
        /* Method n°1 */

        if (deployMethod === 1) {
            await deployer.deploy(SimpleStorage, value, { from: accounts[0], value: ethToSend });
            instance = await SimpleStorage.deployed();

            await instance.get().then((data) => {
                console.log(`Initial value : ${data.words[0]}`);
            });
            await instance.set(Math.floor(Math.random() * 101));
            await instance.get().then((data) => {
                console.log(`New value : ${data.words[0]}`);
            });
        } else if (deployMethod === 2) {
            /* Method n°2 */

            deployer.deploy(SimpleStorage, value, { from: accounts[0], value: ethToSend }).then(async (instance) => {
                await instance.get().then((data) => {
                    console.log(`Initial value : ${data.words[0]}`);
                });
                await instance.set(Math.floor(Math.random() * 101));
                await instance.get().then((data) => {
                    console.log(`New value : ${data.words[0]}`);
                });
            });
        }
    }
};

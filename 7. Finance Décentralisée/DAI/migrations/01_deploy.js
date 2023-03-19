const Dai = artifacts.require('Dai');
const DeFiProject = artifacts.require('DeFiProject');

module.exports = async function (deployer, _network, accounts) {
  await deployer.deploy(Dai);
  const dai = await Dai.deployed();

  await deployer.deploy(DeFiProject, dai.address);
  const defiProject = await DeFiProject.deployed();


  await dai.faucet(defiProject.address, 100);

  const balance00 = await dai.balanceOf(defiProject.address);
  const balance01 = await dai.balanceOf(accounts[1]);

  console.log(balance00.toString());
  console.log(balance01.toString());

  await defiProject.foo(accounts[1], 50);

  const balance0 = await dai.balanceOf(defiProject.address);
  const balance1 = await dai.balanceOf(accounts[1]);

  console.log(balance0.toString());
  console.log(balance1.toString());
};

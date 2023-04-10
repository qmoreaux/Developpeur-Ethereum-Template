# SmartStay

SmartStay is a decentralized application for seasonal renting

## Public Access

SmartStay can be accessed with the following URL : [SmartStay](https://smart-stay.vercel.app/)

## SmartContract

SmartStay is available on the following networks :

* Sepolia at these addresses :
  * [SmartStayRenting](https://sepolia.etherscan.io/address/0xcFaF3116F381d88cF1C1eDd904cd607e2c1a61D1)
  * [SmartStayBooking](https://sepolia.etherscan.io/address/0x2E3462f9B7Db978c44f3dC306b29d499c94B787D)
  * [SmartStayMarketplace](https://sepolia.etherscan.io/address/0x48BDaBdEd14169e106e868d24ef4A1d6d4A61758)
* Mumbai at these addresses
  * [SmartStayRenting](0xf46D3bf64629Fa371b7292D0b0EFAB3A8Fd8CfE4)
  * [SmartStayBooking](0xF97A169724Df2e1Bb5DC403F0Dcc8CFcF4fb4E9b)
  * [SmartStayMarketplace](0x3756146f7933a267958D4Da11F250ccbcea106d6)

> **_NOTE:_** The contract on Mumbai is deployed in `demoMode`, which means that some checks are bypassed (Creating a booking in the past, and creating a booking for your own rentings)

## Demo Video

A few short demo video is available [here](https://www.loom.com/share/folder/899738800b6c480abe46e93e1e158869)

## How to run locally

To run locally, follow the following steps :

* Install the backend dependencies :
  * `cd backend`
* `yarn install`
* Launch a local blockchain :
  * `yarn hardhat node`
* In a separate terminal, deploy the smart contracts :
  * `yarn hardhat run script/deploy.ts`
* Install the frontend dependencies :
  * `cd ../frontend`
  * `yarn install`
* Run the local development server :
  * `yarn dev`

You can now use SmartStay locally on [`http://localhost:3000`](http://localhost:3000)

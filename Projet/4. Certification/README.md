# SmartStay

SmartStay is a decentralized application for seasonal renting

## Public Access

SmartStay can be accessed with the following URL : [SmartStay](https://smart-stay.vercel.app/)

## SmartContract

SmartStay is available on the following networks :

* Sepolia at these addresses :
  * [SmartStayRenting](https://sepolia.etherscan.io/address/0x9e9c9499217616e62EaB0e499e1762f04A6740e2)
  * [SmartStayBooking](https://sepolia.etherscan.io/address/0x505e5c85a0260A60e65cc1A2248D26f78F6143Eb)
  * [SmartStayMarketplace](https://sepolia.etherscan.io/address/0x139d4ee5C657926a8a40a2Ba769b434e8B9F2fF7)
* Mumbai at these addresses
  * [SmartStayRenting](https://mumbai.polygonscan.com/address/0x952fc6936A33a3da17187Fc2D1daF6B3C4D0E832)
  * [SmartStayBooking](https://mumbai.polygonscan.com/address/0xfaf8BA283Daa58c6790f68afEe1730f2210c9a3E)
  * [SmartStayMarketplace](https://mumbai.polygonscan.com/address/0x6831987102Fde226222A04839E3b45c3E9764f25)

> **_NOTE:_** The contract on Mumbai is deployed in `demoMode`, which means that some checks are bypassed (Creating a booking in the past, and creating a booking for your own rentings)

## Demo Video

A few short demo video are available [here](https://www.loom.com/share/folder/899738800b6c480abe46e93e1e158869)

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

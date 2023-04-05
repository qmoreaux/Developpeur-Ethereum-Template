# Backend

This repository contains all the Smart Contracts and Unit Test

## Smart Contracts

SmartStay use 5 smart contracts to function properly :

### SmartStayRenting

Manage all the rentings functionnalities

### SmartStayBooking

Manage all the core functionnalities (Booking, Rating, Minting and burning of NFT/SBT)

### SmartStayDIDCollection

Manage the decentralized identitites collection created by SmartStayBooking

### SmartStaySBTCollection

Manage the SBT collection created by SmartStayBooking

### SmartStayNFTCollection

Manage the NFT collection created by SmartStayBooking

## Unit Tests

Each contract has its own unit test file. They are located in `/test`

The coverage according to `solidity-coverage` is the following :

|File                         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
|-----------------------------|----------|----------|----------|----------|----------------|
| contracts/                  |      100 |    98.21 |      100 |      100 |                |
|  SmartStayBooking.sol       |      100 |    96.67 |      100 |      100 |                |
|  SmartStayDIDCollection.sol |      100 |      100 |      100 |      100 |                |
|  SmartStayNFTCollection.sol |      100 |      100 |      100 |      100 |                |
|  SmartStayRenting.sol       |      100 |      100 |      100 |      100 |                |
|  SmartStaySBTCollection.sol |      100 |      100 |      100 |      100 |                |
| contracts/libraries/        |      100 |      100 |      100 |      100 |                |
|  Tokens.sol                 |      100 |      100 |      100 |      100 |                |
|**All files**                    |      **100** |    **98.21** |      **100** |      **100** |                |

## Deployement

The deployement script not only deploy SmartStayRenting and SmartStayBooking on the corresponding network, it also create a `SmartStay.json` file in the `frontend/` repository, that contains :

* The ABI of the 2 contracts
* The address of the contract on the network it was deployed to

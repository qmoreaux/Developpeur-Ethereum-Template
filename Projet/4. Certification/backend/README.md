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

### Summary

#### SmartStayRentingTest : **17 tests**

* Create : **4 tests**
* Update : **4 tests**
* Delete : **4 tests**
* Search : **5 tests**

#### SmartStayBookingTest : **83 tests**

* Booking : **57 tests**
  * Create : **6 tests**
  * Get renting : **1 test**
  * Status : **50 tests**
    * Approve : **4 tests**
    * Reject : **4 tests**
    * ConfirmBooking : **8 tests**
    * ValidateBookingAsOwner : **7 tests**
    * ValidateBookingAsRecipient : **7 tests**
    * RetrieveDeposit : **6 tests**
    * RetrieveAmount : **6 tests**
    * CancelBooking : **8 tests**
* Rating : **14 tests**
  * Owner : **7 tests**
  * Recipient : **7 tests**
* Tokens : **12 tests**
  * DID : **2 tests**
  * SBT : **3 tests**
  * NFT : **7 tests**

#### SmartStayDIDCollectionTest : **5 tests**

* Create : **4 tests**
* Transfer : **1 test**

#### SmartStaySBTCollectionTest : **10 tests**

* Create : **3 tests**
* Update : **3 tests**
* Burn : **3 tests**
* Transfer : **1 test**

#### SmartStayNFTCollectionTest : **9 tests**

* Create : **3 tests**
* Update : **3 tests**
* Burn : **3 tests**

#### SmartStayMarketplaceTest : **20 tests**

* List token : **7 tests**
* Delist token : **6 tests**
* Execute sale : **7 tests**

#### **Total: 144 tests**

### Coverage

The coverage according to `solidity-coverage` is the following :

| File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |
| -------------------------- | ------- | -------- | ------- | ------- | --------------- |
| contracts/                 | 100     | 98       | 100     | 100     |                 |
| SmartStayBooking.sol       | 100     | 96.51    | 100     | 100     |                 |
| SmartStayDIDCollection.sol | 100     | 100      | 100     | 100     |                 |
| SmartStayMarketplace.sol   | 100     | 97.06    | 100     | 100     |                 |
| SmartStayNFTCollection.sol | 100     | 100      | 100     | 100     |                 |
| SmartStayRenting.sol       | 100     | 100      | 100     | 100     |                 |
| SmartStaySBTCollection.sol | 100     | 100      | 100     | 100     |                 |
| **All files**              | **100** | **98**   | **100** | **100** |                 |

## Deployement

The deployement script not only deploy SmartStayRenting, SmartStayBooking, SmartStayMarketplace on the corresponding network, it also create a `SmartStay.json` file in the `frontend/` repository, that contains :

-   The ABI of the 3 contracts ( + SmartStayNFTCollection)
-   The address of the contract on the network it was deployed to

> **_NOTE:_** The script can not add the address of SmartStayNFTCollection to the JSON file since it can be gotten directly from SmartStayBooking.getNFTCollection()

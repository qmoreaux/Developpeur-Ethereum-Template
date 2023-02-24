# Introduction

This project implements all the units and functionals tests for the smart contract `Voting`, which can be found here : [Voting.sol](https://github.com/lecascyril/CodesSatoshi/blob/main/Voting.sol)

---

# How to use

First, launch `npm install`

This will install the following dependencies :
```js
    "@openzeppelin/contracts": "^4.8.1",
    "@openzeppelin/test-helpers": "^0.5.16",
    "@truffle/hdwallet-provider": "^2.1.7",
    "dotenv": "^16.0.3",
    "eth-gas-reporter": "^0.2.25"
```

Once the install is completed, you can simply launch `ganache` and run `truffle test` in a separate terminal.

---

# Test list

## Whitelist

- **Should whitelist a new address** :

    *Whitelist an address and check that the correct event is emitted*

- **should check that a voter is registered** :

    To describe

- **should not be able whitelist the same address** :

    To describe

- **only owner should be able to whitelist address** :

    To describe

## Proposal

- Before :

    To describe

### Start

- **Workflow Status : should not be able to do anything else than startProposalsRegistering** :

    To describe

- **only owner should be able to start proposal registering** :

    To describe

- **should start proposal registering** :

    To describe

- **should check that the genesis proposal has been added** :

    To describe

### Register

- **should register a proposal** :

    To describe

- **should check that the proposal has been registered** :

    To describe

- **should not be able to register empty proposal** :

    To describe

- **only whitelisted address should be able to register proposal** :

    To describe

### End

- **Workflow Status : should not be able to do anything else than ending the proposal session**  :

    To describe

- **only owner should be able to end the proposal session** :

    To describe

- **should end the proposal session** :

    To describe

## Voting

- Before :

    To describe

### Start 

- **Workflow Status : should not be able to do anything else than starting the voting session** : 

    To describe

- **only owner should be able to start the voting session** :

    To describe

- **should start the voting session** :

    To describe

### Submit

- **should submit a vote** :

    To describe

- **should check that the voter status has been correctly updated** :

    To describe

- **should check that the proposal status has been correctly updated** :

    To describe

- **should not be able to vote twice** :

    To describe

- **only voters should be able to submit a vote** :

    To describe

- **should not be able to vote for a proposal that does not exist** :

    To describe

### End

- **Workflow Status : should not be able to do anything else than ending the voting session** :

    To describe

- **only owner should be able to end the voting session** :

    To describe

- **should end the voting session** :

    To describe

## Tallying Vote

- Before :

    To describe

- **Workflow Status : should not be able to do anything else than tallying votes** :

    To describe

- **only owner should be able to tally the votes** :

    To describe

- **should tally the votes** :

    To describe

- **should get the winning proposal id** :

    To describe

---

# Coverage

The following coverage has been obtained using `solidity-coverage@0.8.2` and `@nomiclabs/hardhat-truffle5@2.0.7`

|File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
|-------------|----------|----------|----------|----------|----------------|
| contracts/  |      100 |    95.83 |      100 |      100 |                |
|  Voting.sol |      100 |    95.83 |      100 |      100 |                |
| All files   |      100 |    95.83 |      100 |      100 |                |

---

# Notes

This project is configured to use `eth-gas-reporter`. To disable it, comment the following lines in truffle-config.js

```js
mocha: {
        // reporter: 'eth-gas-reporter',
        // reporterOptions: {
        //    gasPrice: 1,
        //    token: 'ETH',
        //    showTimeSpent: true
        }
    }
```
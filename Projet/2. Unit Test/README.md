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

    *Get the voter we registered previously and check that isRegistred is true*

- **should not be able whitelist the same address** :

    *Attempt to whitelist the same address and expect a revert*

- **only owner should be able to whitelist address** :

    *Attempt to add a user to the whitelist without being the owner of the contract and expect a revert*

## Proposal

- Before :

    *Create a new instance of the contract, and whitelist 2 users*

### Start

- **Workflow Status : should not be able to do anything else than startProposalsRegistering** :

    *Check that the owner can not do anything else than starting the proposal registering*

- **only owner should be able to start proposal registering** :

    *Attempt to start the proposal registering without being the owner and expect a revert*

- **should start proposal registering** :

    *Start the proposal registering, check that the workflowStatus is correctly updated and that the correct event has been emitted*

- **should check that the genesis proposal has been added** :

    *Get the first proposal and verify that its description matches 'GENESIS'*

### Register

- **should register a proposal** :

    *Register a proposal and check that the correct event has been emitted*

- **should check that the proposal has been registered** :

    *Get the proposal we registered previously and check that the description matches the one we used previously*

- **should register a lot of proposal** :

    *Register a large number of proposal, and check that the correct event are emitted each times*

- **should check that all proposal are registered (and not one more)** :

    *Verify the description of each proposal we registered previously, attempt to get one more proposal and expect a revert*

- **should not be able to register empty proposal** :

    *Attempt to register an empty proposal and expect a revert*

- **only whitelisted address should be able to register proposal** :

    *Attempt to register a proposal with an address that isn't whitelisted and expect a revert*

### End

- **Workflow Status : should not be able to do anything else than ending the proposal session**  :

    *Check that the owner can not do anything else than ending the proposal registering*

- **only owner should be able to end the proposal session** :

    *Attempt to end the proposal registering without being the owner and expect a revert*

- **should end the proposal session** :

    *End the proposal registering, check that the workflowStatus is correctly updated and that the correct event has been emitted*

## Voting

- Before :

    *Create a new instance of the contract, whitelist 2 users and register 4 proposals (2 for each users)*

### Start

- **Workflow Status : should not be able to do anything else than starting the voting session** :

    *Check that the owner can not do anything else than starting the voting session*

- **only owner should be able to start the voting session** :

    *Attempt to start the voting session without being the owner and expect a revert*

- **should start the voting session** :

    *Start the voting session, check that the workflowStatus is correctly updated and that the correct event has been emitted*

### Submit

- **should submit a vote** :

    *Submit a vote and check that correct event has been emitted*

- **should check that the voter status has been correctly updated** :

    *Get the user that submitted the vote, and check that his attributes has been correctly updated*

- **should check that the proposal status has been correctly updated** :

    *Get the proposal the user voted for, and check that its attributes has been correctly updated*

- **should not be able to vote twice** :

    *Attempt to vote a second time with the same user, and expect a revert*

- **only voters should be able to submit a vote** :

    *Attempt to vote with a user that isn't whitelisted, and expect a revert*

- **should not be able to vote for a proposal that does not exist** :

    *Attempt to vote for a proposal that doesn't exist, and expect a revert*

### End

- **Workflow Status : should not be able to do anything else than ending the voting session** :

    *Check that the owner can not do anything else than ending the voting session*

- **only owner should be able to end the voting session** :

    *Attempt to end the voting session without being the owner and expect a revert*

- **should end the voting session** :

    *End the voting session, check that the workflowStatus is correctly updated and that the correct event has been emitted*

## Tallying Vote

- Before :

    *Create a new instance of the contract, whitelist 5 users, register 4 proposals and submit a vote for each users*

- **Workflow Status : should not be able to do anything else than tallying votes** :

    *Check that the owner can not do anything else than tallying the votes*

- **only owner should be able to tally the votes** :

    *Attempt to tally the votes without being the owner and expect a revert*

- **should tally the votes** :

    *Tally the votes, check that the workflowStatus is correctly updated and that the correct event has been emitted*

- **should get the winning proposal id** :

    *Get the winning proposal id, and check that it is the proposal that has received the most votes*

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
        // }
    }
```

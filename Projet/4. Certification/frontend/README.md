# Frontend

The frontend is built using the framework Next.js

## Libraries

It also uses the following libraries :

* Wagmi to add easy to use React hooks
* RainbowKit to easily manage the wallets
* Mui material to add easy to use React components

## Contexts

The frontend is using these 2 custom contexts :

* `ContractContext` implements a readContract and a writeContract hook to easily call and write a Smart Contract
* `AlertContext` implements a setAlert hook to easily show an alert whenever a call is made to the Smart Contract or an error is thrown

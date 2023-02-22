// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts grgr
 */
contract SimpleStorage {

    enum Data {
        Toto,
        Tata,
        Titi
    }

    event NumberSet(Data number); 
    Data public storedData;


    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(Data num) public {
        storedData = num;

        emit NumberSet(storedData);
    }

    /**
     * @dev Return value 
     * @return value of 'number'
     */
    function retrieve() public view returns (Data){
        return storedData;
    }
}
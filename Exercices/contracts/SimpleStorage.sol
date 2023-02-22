// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts grgr
 */
contract SimpleStorage {

    uint256 public number;

        event NumberSet(uint number); 


    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
        require(num > 10, 'Num must be greater than 10');
        number = num;

        emit NumberSet(number);
    }

    /**
     * @dev Return value 
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256){
        return number;
    }
}
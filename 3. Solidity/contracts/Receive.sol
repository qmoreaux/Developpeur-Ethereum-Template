// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

contract Exemples {

    address to = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;

    receive() external payable {
        (bool success, ) = to.call{value: msg.value / 2 }("");
        require(success, "Transfert echoue");
    }

    fallback() external payable {
        
    }
}
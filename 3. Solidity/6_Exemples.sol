// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

contract Exemples {

    address to = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;

    function send() public {
        (bool success, ) = to.call{value: 1}("");
        require(success, "Transfert echoue");
    }

    receive() external payable {

    }

    fallback() external payable {
        
    }
}
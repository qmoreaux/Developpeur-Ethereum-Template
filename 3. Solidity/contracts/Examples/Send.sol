// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

contract Exemples {

    address to = 0xE73E34dc58E839eF58B64B3FC81F37BC864a9065;


    function send() public payable {
        (bool success, ) = to.call{value: msg.value }("");
        require(success, "Transfert echoue");
    }
}
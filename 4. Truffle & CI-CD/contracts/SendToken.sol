// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

contract SendToken {

    address public to;

    constructor(address _addr) {
        to = _addr;
    }


    function send() public payable {
        (bool success, ) = to.call{value: msg.value }("");
        require(success, "Transfert echoue");
    }
}
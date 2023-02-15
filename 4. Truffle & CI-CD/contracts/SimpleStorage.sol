// SPDX-License-Identifier: GPL-3.0
 
pragma solidity 0.8.18;
 
contract SimpleStorage {
    uint data;

    constructor(uint x) payable {
        data = x;
    }
 
    function set(uint x) public {
        data = x;
    }
 
    function get() public view returns (uint) {
        return data;
    }
}
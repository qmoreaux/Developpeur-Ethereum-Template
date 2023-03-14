// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract SimpleStorage {
    
    uint s_number;

    function getNumber() external view returns(uint) {
        return s_number;
    }

    function setNumber(uint _s_number) external {
        s_number = _s_number;
    }
}
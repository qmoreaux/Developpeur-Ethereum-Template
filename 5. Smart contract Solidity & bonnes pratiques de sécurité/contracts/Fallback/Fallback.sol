// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;
 
contract Fallback {

    event DepositValid(address _addr, uint amount);
    event DepositInvalid(address _addr, uint amount);

    mapping(address => uint) balances;

    function addBalance() external payable {
        balances[msg.sender] = msg.value;
    }
 
    receive() external payable {
        emit DepositValid(msg.sender, msg.value);
    }

    fallback() external payable {
        emit DepositInvalid(msg.sender, msg.value);
    }
}
// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

contract Whitelist {

    event Authorized(address _adress);
    event EthReceived(address _addr, uint _value);

    mapping (address => bool) whitelist;

    constructor() {
        whitelist[msg.sender] = true;
    }

    modifier check() {
        require(whitelist[msg.sender], "Not whitelisted");
        _;
    }

    function authorize(address _adress) public check {
        whitelist[_adress] = true;
        emit Authorized(_adress);
    }
}

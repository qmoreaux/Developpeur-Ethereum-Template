// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {

    constructor (uint initialSupply) ERC20("KentouCoin", "KC") {
        _mint(msg.sender, initialSupply);
    }

}
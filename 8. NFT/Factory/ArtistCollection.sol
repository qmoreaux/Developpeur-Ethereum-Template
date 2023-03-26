// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtistCollection is ERC721 {
    using Counters for Counters.counter;
    Counters.counter private _tokenIds;

    constructor() ERC721("", "") {}

    function init(string calldata name_, string calldata symbol_) public {
        _name = name_;
        _symbol = symbol_;
    }
}
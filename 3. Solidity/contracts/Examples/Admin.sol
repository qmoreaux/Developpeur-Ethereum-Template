// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;


import "@openzeppelin/contracts/access/Ownable.sol";

contract Admin is Ownable {

    event Whitelisted(address);
    event Blacklisted(address);

    mapping(address => bool) _whitelist;
    mapping(address => bool) _blacklist;

    function whitelist(address _address) public onlyOwner {
        require(!isWhitelisted(_address), "Address already whitelisted");
        require(!isBlackListed(_address), "Address already blacklisted");
        _whitelist[_address] = true;
        emit Whitelisted(_address);
    }

    function blacklist(address _address) public onlyOwner {
        require(!isWhitelisted(_address), "Address already whitelisted");
        require(!isBlackListed(_address), "Address already blacklisted");
        _blacklist[_address] = true;
        emit Blacklisted(_address);
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return _whitelist[_address];
    }

    function isBlackListed(address _address) public view returns (bool) {
        return _blacklist[_address];
    }

}
// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import './libraries/Tokens.sol';
 
import "hardhat/console.sol";

contract SmartStayNFTCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenID;

    mapping (address => Tokens.SmartStay[]) tokenOwner;
 
    constructor() ERC721 ("SmartStayNFTCollection", "SSNFT") {}

    function getUserNFT(address _address) public view returns  (Tokens.SmartStay[] memory) {
        return tokenOwner[_address];
    }
 
    function mint(address to, string memory _tokenURI) public onlyOwner {
        tokenID.increment();
        uint256 newItemId = tokenID.current();
        _mint(to, newItemId);
        _setTokenURI(newItemId, _tokenURI);


        Tokens.SmartStay memory _token;
        _token.tokenID = newItemId;
        _token.tokenURI = _tokenURI;
        tokenOwner[to].push(_token);
    }

    function update(uint256 _tokenID, string memory _tokenURI) public onlyOwner {
        _setTokenURI(_tokenID, _tokenURI);

        for (uint i; i < tokenOwner[ownerOf(_tokenID)].length; i++) {
            if (tokenOwner[ownerOf(_tokenID)][i].tokenID == _tokenID) {
                tokenOwner[ownerOf(_tokenID)][i].tokenURI = _tokenURI;
            }
        }
    }
    
    function burn(uint256 _tokenID) public onlyOwner {
        _burn(_tokenID);
        for (uint i; i < tokenOwner[ownerOf(_tokenID)].length; i++) {
            if (tokenOwner[ownerOf(_tokenID)][i].tokenID == _tokenID) {
                delete tokenOwner[ownerOf(_tokenID)][i];
            }
        }
    }
}
// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import './libraries/Tokens.sol';
 
contract SmartStayDIDCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenID;

    mapping (address => Tokens.SmartStayDID) tokenOwner;
 
    constructor() ERC721 ("SmartStayDIDCollection", "SSDID") {}

    function getUserDID(address _address) public view returns  (Tokens.SmartStayDID memory) {
        return tokenOwner[_address];
    }
 
    function mint(address to, string memory _tokenURI, string memory _firstname, string memory _lastname, string memory _email, uint256 _registeringNumber) public onlyOwner {
        require(tokenOwner[to].tokenID == 0, 'SmartStay : DID already minted for this address');
        tokenID.increment();
        uint256 newTokenID = tokenID.current();
        _mint(to, newTokenID);
        _setTokenURI(newTokenID, _tokenURI);


        Tokens.SmartStayDID memory _token;
        _token.tokenID = newTokenID;
        _token.tokenURI = _tokenURI;
        _token.firstname = _firstname;
        _token.lastname = _lastname;
        _token.email = _email;
        _token.registeringNumber = _registeringNumber;

        tokenOwner[to] = _token;
    }


    function _beforeTokenTransfer(address from, address, uint256, uint256) pure override internal {
        require(from == address(0), "SmartStay : Can not transfer or burn your DID");
    }
}
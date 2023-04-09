// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SmartStayNFTCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenID;

    mapping (address => SmartStayNFT[]) tokenOwner;

    struct SmartStayNFT {
        uint256 tokenID;
        string tokenURI;
    } 
 
    constructor() ERC721 ("SmartStayNFTCollection", "SSNFT") {}

    /**
     * @dev Return the NFTs for an address
     * @param _address Address of the user to get the NFTs
     * @return Array of NFT possessed by the address passed in parameters
     */
    function getUserNFT(address _address) public view returns  (SmartStayNFT[] memory) {
        return tokenOwner[_address];
    }
 
    /**
     * @dev Mint a new NFT for a user
     * @param to Address to mint the NFT to
     * @param _tokenURI URI of the metadata to add to the NFT
     */
    function mint(address to, string memory _tokenURI) public onlyOwner returns (uint256) {
        tokenID.increment();
        uint256 newTokenID = tokenID.current();
        _mint(to, newTokenID);
        _setTokenURI(newTokenID, _tokenURI);


        SmartStayNFT memory _token;
        _token.tokenID = newTokenID;
        _token.tokenURI = _tokenURI;
        tokenOwner[to].push(_token);

        return newTokenID;
    }

    /**
     * @dev Update the metadata for a token ID
     * @param _tokenID ID of the token to update
     * @param _tokenURI URI of the new metadata
     */
    function update(uint256 _tokenID, string memory _tokenURI) public onlyOwner {
        for (uint i; i < tokenOwner[ownerOf(_tokenID)].length; i++) {
            if (tokenOwner[ownerOf(_tokenID)][i].tokenID == _tokenID) {
                tokenOwner[ownerOf(_tokenID)][i].tokenURI = _tokenURI;
            }
        }

        _setTokenURI(_tokenID, _tokenURI);
    }
    
    /**
     * @dev Burn a NFT
     * @param _tokenID ID of the NFT to burn
     */
    function burn(uint256 _tokenID) public onlyOwner {
        for (uint i; i < tokenOwner[ownerOf(_tokenID)].length; i++) {
            if (tokenOwner[ownerOf(_tokenID)][i].tokenID == _tokenID) {
                tokenOwner[ownerOf(_tokenID)][i] = tokenOwner[ownerOf(_tokenID)][tokenOwner[ownerOf(_tokenID)].length - 1];
                tokenOwner[ownerOf(_tokenID)].pop();
            }
        }

        _burn(_tokenID);
    }

    function transfer(address from, address to, uint256 _tokenID) external {
        for (uint i; i < tokenOwner[from].length; i++) {
            if (tokenOwner[from][i].tokenID == _tokenID) {
                tokenOwner[to].push(tokenOwner[from][i]);
                tokenOwner[from][i] = tokenOwner[from][tokenOwner[from].length - 1];
                tokenOwner[from].pop();
            }
        }

    }

}
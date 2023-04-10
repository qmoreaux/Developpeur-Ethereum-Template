// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SmartStayNFTCollection is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;

    Counters.Counter tokenID;
    uint256[] tokenList;

    struct SmartStayNFT {
        uint256 tokenID;
        string tokenURI;
    } 
 
    constructor() ERC721 ("SmartStayNFTCollection", "SSNFT") {
        tokenList.push(0);
    }

    /**
     * @dev Return the NFTs for an address
     * @param _address Address of the user to get the NFTs
     * @return Array of NFT possessed by the address passed in parameters
     */
    function getUserNFT(address _address) public view returns  (SmartStayNFT[] memory) {
        uint256 count;
        for (uint256 i = 1; i <= tokenID.current() ; i++) {
           
            if (tokenList[i] != 0 && ownerOf(tokenList[i]) == _address) {
                count++;
            }
        }
        SmartStayNFT[] memory userNFT = new SmartStayNFT[](count);
        uint256 index;
        for (uint256 i = 1; i <= tokenID.current() ; i++) {
            if (tokenList[i] != 0 && ownerOf(tokenList[i]) == _address) {
                SmartStayNFT memory _token;

                _token.tokenID = tokenList[i];
                _token.tokenURI = tokenURI(tokenList[i]);

                userNFT[index] = _token;
                index++;
            }
        }
        return userNFT;
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

        tokenList.push(newTokenID);

        return newTokenID;
    }

    /**
     * @dev Update the metadata for a token ID
     * @param _tokenID ID of the token to update
     * @param _tokenURI URI of the new metadata
     */
    function update(uint256 _tokenID, string memory _tokenURI) public onlyOwner {
        _setTokenURI(_tokenID, _tokenURI);
    }
    
    /**
     * @dev Burn a NFT
     * @param _tokenID ID of the NFT to burn
     */
    function burn(uint256 _tokenID) public onlyOwner {
        delete tokenList[_tokenID];

        _burn(_tokenID);
    }
}
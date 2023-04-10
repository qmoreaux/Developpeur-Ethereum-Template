// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
 
contract SmartStaySBTCollection is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;

    Counters.Counter tokenID;
    SmartStaySBT[] tokenList;

     struct SmartStaySBT {
        uint256 tokenID;
        uint256 bookingID;
        string tokenURI;
        string location;
        uint64 duration;
        uint128 price;
        address owner;
    } 
 
    constructor() ERC721 ("SmartStayBSTCollection", "SSSBT") {
        SmartStaySBT memory _token;
        tokenList.push(_token);
    }

    /**
     * @dev Return the SBTs for an address
     * @param _address Address of the user to get the SBTs
     * @return Array of SBT possessed by the address passed in parameters
     */
    function getUserSBT(address _address) public view returns  (SmartStaySBT[] memory) {
        uint256 count;
        for (uint256 i = 1; i <= tokenID.current() ; i++) {
           
            if (tokenList[i].tokenID != 0 && ownerOf(tokenList[i].tokenID) == _address) {
                count++;
            }
        }
        SmartStaySBT[] memory userSBT = new SmartStaySBT[](count);
        uint256 index;
        for (uint256 i = 1; i <= tokenID.current() ; i++) {
            if (tokenList[i].tokenID != 0 && ownerOf(tokenList[i].tokenID) == _address) {
                SmartStaySBT memory _token;

                _token = tokenList[i];
                _token.tokenURI = tokenURI(tokenList[i].tokenID);
               

                userSBT[index] = _token;
                index++;
            }
        }
        return userSBT;
    }
 
    /**
     * @dev Mint a new SBT for a user
     * @param _to Address to mint the SBT to
     * @param _tokenURI URI of the metadata to add to the SBT
     * @param _duration Duration of the booking attached to the SBT
     * @param _price Price of the booking attached to the SBT
     * @param _bookingID Booking ID of the booking attached to the SBT
     */
    function mint(address _to, string memory _tokenURI, uint64 _duration, uint128 _price, uint256 _bookingID) public onlyOwner returns (uint256){
        tokenID.increment();
        uint256 newTokenID = tokenID.current();

        _mint(_to, newTokenID);
        _setTokenURI(newTokenID, _tokenURI);

        SmartStaySBT memory _token;
        _token.tokenID = newTokenID;
        _token.duration = _duration;
        _token.price = _price;
        _token.bookingID = _bookingID;
        tokenList.push(_token);

        return newTokenID;
    }

    /**
     * @dev Update a SBT
     * @param _tokenID ID of the SBT to update
     * @param _tokenURI URI of the new metadata to attach to the SBT
     * @param _location Location of the booking attached to the SBT
     * @param _owner Address of the owner of the SBT
     */
    function update(uint256 _tokenID, string memory _tokenURI, string memory _location, address _owner) public onlyOwner {
        tokenList[_tokenID].location = _location;
        tokenList[_tokenID].owner = _owner;
    
        _setTokenURI(_tokenID, _tokenURI);
    }
    
    /**
     * @dev Burn a SBT
     * @param _tokenID ID of the SBT to burn
     */
    function burn(uint256 _tokenID) public onlyOwner {
        delete tokenList[_tokenID];

        _burn(_tokenID);
    }

   function _beforeTokenTransfer(address from, address to, uint256, uint256) pure override internal {
        require(from == address(0) || to == address(0), "SmartStay : Can not transfer a SBT");
    }
}

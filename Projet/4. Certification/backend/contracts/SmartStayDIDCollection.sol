// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
 
contract SmartStayDIDCollection is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;

    Counters.Counter tokenID;
    SmartStayDID[] tokenList;

    struct SmartStayDID {
        uint256 tokenID;
        string tokenURI;
        uint256 registeringNumber;
        string lastname;
        string firstname;
        string email;
    } 
 
    constructor() ERC721 ("SmartStayDIDCollection", "SSDID") {
        SmartStayDID memory _token;
        tokenList.push(_token);
    }

    /**
     * @dev Return the DID for an address
     * @param _address Address of the user to get the DID
     * @return token DID possessed by the address passed in parameters
     */
    function getUserDID(address _address) public view returns  (SmartStayDID memory token) {
        for (uint256 i = 1; i <= tokenID.current() ; i++) {
            if (tokenList[i].tokenID != 0 && ownerOf(tokenList[i].tokenID) == _address) {
                SmartStayDID memory _token;

                _token = tokenList[i];
                _token.tokenURI = tokenURI(tokenList[i].tokenID);

                return _token;
            }
        }
    }
 
     /**
     * @dev Create a DID for a user
     * @param _to Address to mint the DID for
     * @param _tokenURI URI of the DID metadata
     * @param _firstname Firstname of the user
     * @param _lastname Lastname of the user
     * @param _email Email of the user
     * @param _registeringNumber Registering number of the user
     */
    function mint(address _to, string memory _tokenURI, string memory _firstname, string memory _lastname, string memory _email, uint256 _registeringNumber) public onlyOwner {
        require(balanceOf(_to) == 0, 'SmartStay : DID already minted for this address');

        tokenID.increment();
        uint256 newTokenID = tokenID.current();

        _mint(_to, newTokenID);
        _setTokenURI(newTokenID, _tokenURI);

        SmartStayDID memory _token;
        _token.tokenID = newTokenID;
        _token.firstname = _firstname;
        _token.lastname = _lastname;
        _token.email = _email;
        _token.registeringNumber = _registeringNumber;

        tokenList.push(_token);
    }


    function _beforeTokenTransfer(address from, address, uint256, uint256) pure override internal {
        require(from == address(0), "SmartStay : Can not transfer or burn your DID");
    }
}
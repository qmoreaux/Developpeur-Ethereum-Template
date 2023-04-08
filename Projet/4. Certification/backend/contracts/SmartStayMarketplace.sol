// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";

import "./SmartStayNFTCollection.sol";

contract SmartStayMarketplace {

    // State Variables

    SmartStayNFTCollection NFTCollection;

    // Events 

    event TokenListed(ListedToken token);
    event TokenDelisted(uint256 tokenID);
    event TokenSold (uint256 tokenId, uint256 price, address from, address to);

    // Modifiers

     /**
     * @dev Modifier to check if caller is recipient of a booking
     * @param _tokenID Id of a NFT
     */
    modifier isTokenOwner(uint _tokenID) {
        require(NFTCollection.ownerOf(_tokenID) == msg.sender, 'SmartStay : Not owner of the token');
        _;
    }

    struct ListedToken {
        uint256 tokenID;
        address payable owner;
        uint256 price;
    }

    ListedToken[] listedToken;

    constructor(address _address) {
        NFTCollection = SmartStayNFTCollection(_address);
    }

    function getListedNFT() public view returns (ListedToken[] memory) {
        uint tokenCount;

        for (uint i; i < listedToken.length; i++) {
            if (listedToken[i].tokenID != 0){
                tokenCount++;
            }
        }

        ListedToken[] memory tokens = new ListedToken[](tokenCount);
        uint currentIndex;
        for(uint i=0; i < listedToken.length; i++) {
            if (listedToken[i].tokenID != 0){
                tokens[currentIndex] = listedToken[i];
                currentIndex++;
            }
        }

        return tokens;
    }

    
    function getMyListedNFT() public view returns (ListedToken[] memory) {
        uint tokenCount;

        for (uint i; i < listedToken.length; i++) {
            if (listedToken[i].owner == msg.sender){
                tokenCount++;
            }
        }

        ListedToken[] memory tokens = new ListedToken[](tokenCount);
        uint currentIndex;
        for(uint i=0; i < listedToken.length; i++) {
            if (listedToken[i].owner == msg.sender){
                tokens[currentIndex] = listedToken[i];
                currentIndex++;
            }
        }

        return tokens;
    }


    function getToken(uint256 _tokenID) public view returns (ListedToken memory token) {
        for (uint i; i < listedToken.length; i++) {
            if (listedToken[i].tokenID == _tokenID){
                return listedToken[i];
            }
        }
    }

    function listToken(uint256 _tokenID, uint256 _price) external isTokenOwner(_tokenID) {
        require(NFTCollection.getApproved(_tokenID) == address(this), 'SmartStay : Token not approved');
        require(getToken(_tokenID).tokenID == 0, 'SmartStay : Token already listed');
    
        ListedToken memory _token;
        _token.tokenID = _tokenID;
        _token.owner = payable(msg.sender);
        _token.price = _price;
        listedToken.push(_token);

        emit TokenListed(_token);
    }

    function delistToken(uint256 _tokenID) external isTokenOwner(_tokenID) {
        require(getToken(_tokenID).tokenID != 0, 'SmartStay : Token not listed');

        for (uint i; i < listedToken.length; i++) {
            if (listedToken[i].tokenID == _tokenID){
                delete listedToken[i];
            }
        }

        emit TokenDelisted(_tokenID);
    }

    function executeSale(uint256 _tokenID) public payable {
        require(getToken(_tokenID).tokenID != 0, "SmartStay : Token not listed");
        require(getToken(_tokenID).price == msg.value, "SmartStay : Wrong amount sent");
        require(getToken(_tokenID).owner != msg.sender, "SmartStay : Can not buy your own NFT");

        address payable owner = getToken(_tokenID).owner;

        for (uint i; i < listedToken.length; i++) {
            if (listedToken[i].tokenID == _tokenID){
                delete listedToken[i];
            }
        }

        NFTCollection.safeTransferFrom(owner, msg.sender, _tokenID);

        (bool success, ) = owner.call{value: msg.value}("");
        require(success, 'SmartStay: Funds transfer failed');  

        emit TokenSold(_tokenID, msg.value, owner, msg.sender); 
    }
}
// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

library Tokens {

    struct SmartStayNFT {
        uint256 tokenID;
        string tokenURI;
    } 

    struct SmartStaySBT {
        uint256 tokenID;
        uint256 bookingID;
        string tokenURI;
        string location;
        uint64 duration;
        uint128 price;
        address owner;
    } 

    struct SmartStayDID {
        uint256 tokenID;
        string tokenURI;
        uint256 registeringNumber;
        string lastname;
        string firstname;
        string email;
    } 
}
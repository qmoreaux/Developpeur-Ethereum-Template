// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";

contract SmartStay {
        
    using Counters for Counters.Counter;
    Counters.Counter private currentIndex;


    // State Variables

    mapping(address => Renting[]) userRentings;
    Renting[] rentings;

    // Events 

    event RentingCreated(Renting _renting);
    event RentingUpdated(Renting _renting);
    event RentingDeleted(uint _rentingIndex);
    event ReservationCreated();
    event ReservationValidated();

    // Modifiers

    modifier isRentingOwner(uint index) {
        require(isUserRentingOwner(index), 'SmartStay: Not owner of the renting');
        _;
    }

    // Struct, Arrays, Enums

    struct Renting {
        uint256 index;
        uint16 unitPrice;
        uint8 personCount;
        string location;
        string[] tags;
        string description;
        string imageURL;
    }

    // Constructor

    constructor() {
        Renting memory _renting;
        rentings.push(_renting);
        currentIndex.increment();
    }

    function searchRenting(uint16 unitPrice, uint8 personCount) external view returns (Renting[] memory) {
        if (unitPrice > 0 && personCount > 0) {
            return rentings;
        }
        return rentings;
    }

    function createRenting(
        uint16 unitPrice,
        uint8 personCount,
        string calldata location,
        string[] calldata tags,
        string calldata description,
        string calldata imageURL
        ) external returns (uint) {
        require(userRentings[msg.sender].length < 5, 'SmartStay : Too many renting');

        Renting memory tempRenting;
        tempRenting.index = currentIndex.current();
        tempRenting.unitPrice = unitPrice;
        tempRenting.personCount = personCount;
        tempRenting.location = location;
        tempRenting.tags = tags;
        tempRenting.description = description;
        tempRenting.imageURL = imageURL;

        rentings.push(tempRenting);
        userRentings[msg.sender].push(tempRenting);

        currentIndex.increment();

        emit RentingCreated(tempRenting);

        return currentIndex.current();
    }

    function updateRenting(
        uint index,
        uint16 unitPrice,
        uint8 personCount,
        string calldata location,
        string[] calldata tags,
        string calldata description,
        string calldata imageURL
    ) external isRentingOwner(index) {

        Renting memory tempRenting;
        tempRenting.index = index;
        tempRenting.unitPrice = unitPrice;
        tempRenting.personCount = personCount;
        tempRenting.location = location;
        tempRenting.tags = tags;
        tempRenting.description = description;
        tempRenting.imageURL = imageURL;

        rentings[index]= tempRenting;
        userRentings[msg.sender][getUserRentingIndex(index)] = tempRenting;

        emit RentingUpdated(tempRenting);
    }

    function deleteRenting(uint index) external isRentingOwner(index) {
        delete rentings[index];

        uint userIndex = getUserRentingIndex(index);
        userRentings[msg.sender][userIndex] = userRentings[msg.sender][userRentings[msg.sender].length - 1];
        userRentings[msg.sender].pop();

        emit RentingDeleted(index);
    }

    function getUserRenting() external view returns (Renting[] memory) {
        return userRentings[msg.sender];
    }

    function isUserRentingOwner(uint index) private view returns (bool) {
        for (uint i = 0; i < userRentings[msg.sender].length; i++) {
            if (userRentings[msg.sender][i].index == index) {
                return true;
            }
        }
        return false;
    }

    function getUserRentingIndex(uint256 index) private view returns (uint) {
        for (uint i = 0; i < userRentings[msg.sender].length; i++) {
            if (userRentings[msg.sender][i].index == index) {
                return i;
            }
        }
        return 0;
    }

}

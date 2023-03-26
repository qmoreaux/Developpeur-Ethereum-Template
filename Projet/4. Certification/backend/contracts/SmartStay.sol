// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";

contract SmartStay {
        
    using Counters for Counters.Counter;
    Counters.Counter private currentIndex;


    // State Variables

    mapping(address => Renting[]) userRentings;
    Renting[] rentings;
    string[] tags = ['Maisons', 'Appartement', 'Piscine', 'Montagne', 'Bord de mer'];
    string[] locations;

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

    function getTags() external view returns (string[] memory) {
        return tags;
    }

    function getLocations() external view returns (string[] memory) {
        return locations;
    }


    function searchRenting(uint16 _maxUnitPrice, uint8 _personCount, string calldata _location, string[] calldata _tags) external view returns (Renting[] memory) {
        uint _count;
        for (uint i; i < rentings.length; i++) {
            if (rentings[i].index != 0) {
                if (_maxUnitPrice == 0 || rentings[i].unitPrice <= _maxUnitPrice) {
                    if (_personCount == 0 || rentings[i].personCount <= _personCount) {
                        if (bytes(_location).length == 0 || compareString(rentings[i].location,_location)) {
                            if (_tags.length == 0 || containTags(rentings[i], _tags)) {
                                _count++;
                            }
                        }
                    }
                }
            }
        }

        Renting[] memory _rentings = new Renting[](_count);
        uint _index;
        for (uint i; i < rentings.length; i++) {
            if (rentings[i].index != 0) {
                if (_maxUnitPrice == 0 || rentings[i].unitPrice <= _maxUnitPrice) {
                    if (_personCount == 0 || rentings[i].personCount == _personCount) {
                        if (bytes(_location).length == 0 || compareString(rentings[i].location,_location)) {
                            if (_tags.length == 0 || containTags(rentings[i], _tags)) {
                                _rentings[_index] = rentings[i];
                                _index++;
                            }
                        }
                    }
                }
            }
        }

        return _rentings;
    }

    function createRenting(
        uint16 _unitPrice,
        uint8 _personCount,
        string calldata _location,
        string[] calldata _tags,
        string calldata _description,
        string calldata _imageURL
        ) external returns (uint) {
        require(userRentings[msg.sender].length < 5, 'SmartStay : Too many renting');

        Renting memory tempRenting;
        tempRenting.index = currentIndex.current();
        tempRenting.unitPrice = _unitPrice;
        tempRenting.personCount = _personCount;
        tempRenting.location = _location;
        tempRenting.tags = _tags;
        tempRenting.description = _description;
        tempRenting.imageURL = _imageURL;

        rentings.push(tempRenting);
        userRentings[msg.sender].push(tempRenting);

        currentIndex.increment();

        emit RentingCreated(tempRenting);

        return currentIndex.current();
    }

    function updateRenting(
        uint _index,
        uint16 _unitPrice,
        uint8 _personCount,
        string calldata _location,
        string[] calldata _tags,
        string calldata _description,
        string calldata _imageURL
    ) external isRentingOwner(_index) {

        Renting memory tempRenting;
        tempRenting.index = _index;
        tempRenting.unitPrice = _unitPrice;
        tempRenting.personCount = _personCount;
        tempRenting.location = _location;
        tempRenting.tags = _tags;
        tempRenting.description = _description;
        tempRenting.imageURL = _imageURL;

        rentings[_index]= tempRenting;
        userRentings[msg.sender][getUserRentingIndex(_index)] = tempRenting;

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

    // Utils

    function compareString(string memory a, string memory b) private pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function containTags(Renting memory _renting, string[] memory _tags) private pure returns (bool) {
        for (uint i; i < _tags.length; i++) {
            bool tagFound;
            for (uint j; j < _renting.tags.length; j++) {
                if (compareString(_renting.tags[j], _tags[i])) {
                    tagFound = true;
                }
            }
            if (!tagFound) {
                return false;
            }
        }
        return true;
    }

}

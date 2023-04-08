// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";

/** 
 * @title SmartStayRenting
 * @author Quentin Moreaux
 * @dev Implements renting functionnalities for SmartStay Dapp
 */
contract SmartStayRenting {

    using Counters for Counters.Counter;

    // State Variables

    Counters.Counter private index;

    mapping(address => Renting[]) userRentings;
    Renting[] rentings;

    bool demoMode; // Used to avoid certain checks to make demo easier

    // Events 

    event RentingCreated(Renting renting);
    event RentingUpdated(Renting renting);
    event RentingDeleted(uint rentingIndex);


    // Modifiers

    /**
     * @dev Modifier to check if caller is owner of a renting
     * @param _rentingID Id of a renting
     */
    modifier isRentingOwner(uint _rentingID) {
        require (rentings[_rentingID].owner == msg.sender, 'SmartStay: Not owner of the renting');
        _;
    }

    struct Renting {
        uint256 id;
        uint128 unitPrice;
        uint128 deposit;
        address owner;
        uint64 personCount;
        string location;
        string[] tags;
        string description;
        string imageURL;
    }

    // Constructor

    constructor(bool _demoMode) {

        demoMode = _demoMode;

        // Create empty renting and booking to avoid issue with index 0
        Renting memory _renting;
        rentings.push(_renting);
        index.increment();

    }

    // Renting

    /**
     * @dev Search rentings matching the filters passed as parameters
     * @param _maxUnitPrice Maximum price for a single day
     * @param _maxPersonCount Maximum number of person
     * @param _location Location of the renting
     * @param _tags List of tags of the renting
     * @return All the rentings matching the filters
     */
    function searchRenting(uint128 _maxUnitPrice, uint64 _maxPersonCount, string calldata _location, string[] calldata _tags) external view returns (Renting[] memory) {
        uint _count;
        for (uint i; i < rentings.length; i++) {
            if (rentings[i].id != 0) {
                if (_maxUnitPrice == 0 || rentings[i].unitPrice <= _maxUnitPrice) {
                    if (_maxPersonCount == 0 || rentings[i].personCount >= _maxPersonCount) {
                        if (bytes(_location).length == 0 || compareString(rentings[i].location,_location)) {
                            if (_tags.length == 0 || containTags(rentings[i].tags, _tags)) {
                                if (rentings[i].owner != msg.sender || demoMode) {
                                    _count++;
                                }
                            }
                        }
                    }
                }
            }
        }

        Renting[] memory _rentings = new Renting[](_count);
        uint _index;
        for (uint i; i < rentings.length; i++) {
            if (rentings[i].id != 0) {
                if (_maxUnitPrice == 0 || rentings[i].unitPrice <= _maxUnitPrice) {
                    if (_maxPersonCount == 0 || rentings[i].personCount >= _maxPersonCount) {
                        if (bytes(_location).length == 0 || compareString(rentings[i].location,_location)) {
                            if (_tags.length == 0 || containTags(rentings[i].tags, _tags)) {
                                if (rentings[i].owner != msg.sender || demoMode) {
                                    _rentings[_index] = rentings[i];
                                    _index++;
                                }
                            }
                        }
                    }
                }
            }
        }

        return _rentings;
    }

    /**
     * @dev Create a new renting
     * @param _renting The renting to create
     */
    function createRenting(
        Renting calldata _renting
        ) external {
        require(userRentings[msg.sender].length < 5, 'SmartStay : Too many renting');

        Renting memory tempRenting;
        tempRenting.id = index.current();
        tempRenting.owner = msg.sender;
        tempRenting.unitPrice = _renting.unitPrice;
        tempRenting.deposit = _renting.deposit;
        tempRenting.personCount = _renting.personCount;
        tempRenting.location = _renting.location;
        tempRenting.tags = _renting.tags;
        tempRenting.description = _renting.description;
        tempRenting.imageURL = _renting.imageURL;

        rentings.push(tempRenting);
        userRentings[msg.sender].push(tempRenting);

        index.increment();

        emit RentingCreated(tempRenting);
    }

    /**
     * @dev Update an existing renting if the caller is the owner of the renting
     * @param _rentingID Id of the renting to update
     * @param _renting The updated renting
     */
    function updateRenting(
        uint _rentingID,
        Renting calldata _renting
    ) external isRentingOwner(_rentingID) {
        Renting memory tempRenting;
        tempRenting.id = _rentingID;
        tempRenting.owner = msg.sender;
        tempRenting.unitPrice = _renting.unitPrice;
        tempRenting.deposit = _renting.deposit;
        tempRenting.personCount = _renting.personCount;
        tempRenting.location = _renting.location;
        tempRenting.tags = _renting.tags;
        tempRenting.description = _renting.description;
        tempRenting.imageURL = _renting.imageURL;

        rentings[_rentingID]= tempRenting;
        userRentings[msg.sender][getUserRentingIndex(_rentingID)] = tempRenting;

        emit RentingUpdated(tempRenting);
    }

    /**
     * @dev Delete a renting
     * @param _rentingID Id of the renting to delete
     */
    function deleteRenting(uint _rentingID) external isRentingOwner(_rentingID) {
        delete rentings[_rentingID];

        uint userIndex = getUserRentingIndex(_rentingID);
        userRentings[msg.sender][userIndex] = userRentings[msg.sender][userRentings[msg.sender].length - 1];
        userRentings[msg.sender].pop();

        emit RentingDeleted(_rentingID);
    }

    /**
     * @dev Get a renting from an ID
     * @param _rentingID Id of the renting to get
     * @return Renting matching the id passed in parameters
     */
    function getRenting(uint _rentingID) external view returns (Renting memory) {
        return rentings[_rentingID];
    }

    /**
     * @dev Get all rentings created by the caller
     * @return Array of Renting where the caller is owner
     */
    function getUserRenting() external view returns (Renting[] memory) {
        return userRentings[msg.sender];
    }

    /**
     * @dev Get index in userRenting for an id
     * @param _id Id of a renting
     * @return _index Index of the renting in userRenting
     */
    function getUserRentingIndex(uint256 _id) private view returns (uint _index) {
        for (uint i = 0; i < userRentings[msg.sender].length; i++) {
            if (userRentings[msg.sender][i].id == _id) {
                return i;
            }
        }
    }

    // Utils

    /**
     * @dev Check if the renting contains tags
     * @param tags Tags of renting to iterate
     * @param _tags Tags to check
     * @return All rentings that contains all the tags
     */
    function containTags(string[] memory tags, string[] memory _tags) public pure returns (bool) {
        for (uint i; i < _tags.length; i++) {
            bool tagFound;
            for (uint j; j < tags.length; j++) {
                if (compareString(tags[j], _tags[i])) {
                    tagFound = true;
                }
            }
            if (!tagFound) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Check if two strings are equal
     * @param a First string to compare
     * @param b Second string to compare
     * @return True of both string are equal, false otherwise
     */
    function compareString(string memory a, string memory b) public pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}

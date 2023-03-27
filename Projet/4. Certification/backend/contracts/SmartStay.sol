// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

/** 
 * @title Voting
 * @author Quentin Moreaux
 * @dev Implements functionnalities for SmartStay Dapp
 */
contract SmartStay {
        
    using Counters for Counters.Counter;

    // State Variables

    Counters.Counter private indexRenting;
    Counters.Counter private indexBooking;


    string[] tags = ['Maison', 'Appartement', 'Piscine', 'Montagne', 'Bord de mer'];

    mapping(address => Renting[]) userRentings;
    Renting[] rentings;

    Booking[] bookings;
    mapping(address => uint[]) bookingRecipient; // mapping to array of booking id (as recipient)
    mapping(address => uint[]) bookingOwner; // mapping to array of booking id (as owner)

    // Events 

    event RentingCreated(Renting renting);
    event RentingUpdated(Renting renting);
    event RentingDeleted(uint rentingIndex);
    event BookingCreated();
    event BookingValidated();

    // Modifiers

    /**
     * @dev Modifier to check if caller is owner of a renting
     * @param _id Id of a renting
     */
    modifier isRentingOwner(uint _id) {
        require (rentings[_id].owner == msg.sender, 'SmartStay: Not owner of the renting');
        _;
    }

    modifier isBookingOwner(uint _bookingID) {
        bool foundBooking;
        for (uint i; i < bookingOwner[msg.sender].length; i++) {
            if (bookingOwner[msg.sender][i] == _bookingID) {
                foundBooking = true;
            }
        }
        if (!foundBooking) {
            revert('SmartStay: Not owner of the booking');
        }
        _;
    }

    modifier isBookingRecipient(uint _bookingID) {
        bool foundBooking;
        for (uint i; i < bookingRecipient[msg.sender].length; i++) {
            if (bookingRecipient[msg.sender][i] == _bookingID) {
                foundBooking = true;
            }
        }
        if (!foundBooking) {
            revert('SmartStay: Not owner of the booking');
        }
        _;
    }


    // Struct, Arrays, Enums

    struct Renting {
        address owner;
        uint256 id;
        uint16 unitPrice;
        uint16 caution;
        uint8 personCount;
        string location;
        string[] tags;
        string description;
        string imageURL;
    }

    struct Booking {
        uint256 id;
        uint256 rentingID;
        uint256 amountPayed;
        uint256 cautionPayed;
        uint32 timestampStart;
        uint32 timestampEnd;
        uint16 duration;
        uint8 personCount;
        BookingStatus status;
    }

    enum BookingStatus {
        CREATED,
        REJECTED,
        WAITING_FOR_PAYMENT,
        ONGOING,
        COMPLETED
    }

    // Constructor

    constructor() {
        Renting memory _renting;
        rentings.push(_renting);
        indexRenting.increment();

        Booking memory _booking;
        bookings.push(_booking);
        indexBooking.increment();
    }

    /**
     * @dev Returns all possible tags for a renting
     * @return All possible tags for a renting
     */
    function getTags() external view returns (string[] memory) {
        return tags;
    }

    // Renting

    /**
     * @dev Search rentings matching the filters passed as parameters
     * @param _maxUnitPrice Maximum price for a single day
     * @param _personCount Maximum number of person
     * @param _location Location of the renting
     * @param _tags List of tags of the renting
     * @return All the rentings matching the filters
     */
    function searchRenting(uint16 _maxUnitPrice, uint8 _personCount, string calldata _location, string[] calldata _tags) external view returns (Renting[] memory) {
        uint _count;
        for (uint i; i < rentings.length; i++) {
            if (rentings[i].id != 0) {
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
            if (rentings[i].id != 0) {
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

    /**
     * @dev Create a new renting
     * @param _renting The renting to create
     */
    function createRenting(
        Renting calldata _renting
        ) external {
        require(userRentings[msg.sender].length < 5, 'SmartStay : Too many renting');

        Renting memory tempRenting;
        tempRenting.id = indexRenting.current();
        tempRenting.owner = msg.sender;
        tempRenting.unitPrice = _renting.unitPrice;
        tempRenting.caution = _renting.caution;
        tempRenting.personCount = _renting.personCount;
        tempRenting.location = _renting.location;
        tempRenting.tags = _renting.tags;
        tempRenting.description = _renting.description;
        tempRenting.imageURL = _renting.imageURL;

        rentings.push(tempRenting);
        userRentings[msg.sender].push(tempRenting);

        indexRenting.increment();

        emit RentingCreated(tempRenting);
    }

    /**
     * @dev Update an existing renting if the caller is the owner of the renting
     * @param _id Id of the renting to update
     * @param _renting The updated renting
     */
    function updateRenting(
        uint _id,
        Renting calldata _renting
    ) external isRentingOwner(_id) {

        Renting memory tempRenting;
        tempRenting.id = _id;
        tempRenting.owner = msg.sender;
        tempRenting.unitPrice = _renting.unitPrice;
        tempRenting.caution = _renting.caution;
        tempRenting.personCount = _renting.personCount;
        tempRenting.location = _renting.location;
        tempRenting.tags = _renting.tags;
        tempRenting.description = _renting.description;
        tempRenting.imageURL = _renting.imageURL;

        rentings[_id]= tempRenting;
        userRentings[msg.sender][getUserRentingIndex(_id)] = tempRenting;

        emit RentingUpdated(tempRenting);
    }

    /**
     * @dev Delete a renting
     * @param _id Id of the renting to delete
     */
    function deleteRenting(uint _id) external isRentingOwner(_id) {
        delete rentings[_id];

        uint userIndex = getUserRentingIndex(_id);
        userRentings[msg.sender][userIndex] = userRentings[msg.sender][userRentings[msg.sender].length - 1];
        userRentings[msg.sender].pop();

        emit RentingDeleted(_id);
    }

    function getRenting(uint _id) external view returns (Renting memory) {
        return rentings[_id];
    }

    function getRentingFromBookingID(uint _bookingID) external view returns (Renting memory) {
        return rentings[bookings[_bookingID].rentingID];
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
     * @return Index of the renting in userRenting
     */
    function getUserRentingIndex(uint256 _id) private view returns (uint) {
        for (uint i = 0; i < userRentings[msg.sender].length; i++) {
            if (userRentings[msg.sender][i].id == _id) {
                return i;
            }
        }
        return 0; // Will never happen since we always check that the caller is owner of the renting
    }

    // Booking 

    /**
     * @dev Create a booking
     * @param _rentingID Id of the renting to book
     * @param _timestampStart Start of the booking
     * @param _duration Duration of the booking (in days)
     * @param _personCount Number of person
     */
    function createBooking(uint256 _rentingID, uint32 _timestampStart, uint16 _duration, uint8 _personCount) external {
        Booking memory _booking;

        _booking.id = indexBooking.current();
        _booking.rentingID = _rentingID;
        _booking.timestampStart = _timestampStart;
        _booking.duration = _duration;
        _booking.timestampEnd = _timestampStart + _duration * 1 days;
        _booking.personCount = _personCount;

        bookings.push(_booking);
        bookingOwner[rentings[_rentingID].owner].push(indexBooking.current());
        bookingRecipient[msg.sender].push(indexBooking.current());

        indexBooking.increment();
    }

    /**
     * @dev Returns all the bookings where caller is owner
     * @return All bookings where caller is owner
     */
    function getBookingOwner() external view returns (Booking[] memory) {
        Booking[] memory _bookings = new Booking[](bookingOwner[msg.sender].length);

        for (uint i; i < bookingOwner[msg.sender].length; i++) {
            _bookings[i] = bookings[bookingOwner[msg.sender][i]];
        }

        return _bookings;
    }

    /**
     * @dev Returns all the bookings where caller is recipient
     * @return All bookings where caller is recipient
     */
    function getBookingRecipient() external view returns (Booking[] memory) {
        Booking[] memory _bookings = new Booking[](bookingRecipient[msg.sender].length);

        for (uint i; i < bookingRecipient[msg.sender].length; i++) {
            _bookings[i] = bookings[bookingRecipient[msg.sender][i]];
        }

        return _bookings;
    }

    function approveBooking(uint256 _bookingID) external isBookingOwner(_bookingID) {
        bookings[_bookingID].status = BookingStatus.WAITING_FOR_PAYMENT;
    }

    function rejectBooking(uint256 _bookingID) external isBookingOwner(_bookingID) {
        bookings[_bookingID].status = BookingStatus.REJECTED;
    }

    function confirmBooking(uint256 _bookingID) external payable isBookingRecipient(_bookingID) {
        console.log(msg.value);
        console.log(rentings[bookings[_bookingID].rentingID].unitPrice);
        console.log(bookings[_bookingID].duration );
        console.log(rentings[bookings[_bookingID].rentingID].caution);
        console.log(rentings[bookings[_bookingID].rentingID].unitPrice * bookings[_bookingID].duration + rentings[bookings[_bookingID].rentingID].caution);
        console.log(150 * 1 ether);
        console.log((rentings[bookings[_bookingID].rentingID].unitPrice * bookings[_bookingID].duration + rentings[bookings[_bookingID].rentingID].caution) * 1 ether);

        require(msg.value >= (rentings[bookings[_bookingID].rentingID].unitPrice * bookings[_bookingID].duration + rentings[bookings[_bookingID].rentingID].caution) * 1 ether, 'SmartStay: Not enought send');
        
        // bookings[_bookingID].amountPayed = rentings[bookings[_bookingID].rentingID].unitPrice * 1 ether * bookings[_bookingID].duration;
        // bookings[_bookingID].cautionPayed = rentings[bookings[_bookingID].rentingID].caution * 1 ether;

        bookings[_bookingID].status = BookingStatus.ONGOING;
    }


    // Utils

    /**
     * @dev Check if two strings are equal
     * @param a First string to compare
     * @param b Second string to compare
     * @return True of both string are equal, false otherwise
     */
    function compareString(string memory a, string memory b) private pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /**
     * @dev Check if the renting contains tags
     * @param _renting Renting to iterate
     * @param _tags Tags to check
     * @return All rentings that contains all the tags
     */
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

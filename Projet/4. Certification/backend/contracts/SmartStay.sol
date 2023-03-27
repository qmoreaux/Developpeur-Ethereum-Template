// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";

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
     * @param _rentingID Id of a renting
     */
    modifier isRentingOwner(uint _rentingID) {
        require (rentings[_rentingID].owner == msg.sender, 'SmartStay: Not owner of the renting');
        _;
    }

    /**
     * @dev Modifier to check if caller is owner of a booking
     * @param _bookingID Id of a booking
     */
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

    /**
     * @dev Modifier to check if caller is recipient of a booking
     * @param _bookingID Id of a booking
     */
    modifier isBookingRecipient(uint _bookingID) {
        bool foundBooking;
        for (uint i; i < bookingRecipient[msg.sender].length; i++) {
            if (bookingRecipient[msg.sender][i] == _bookingID) {
                foundBooking = true;
            }
        }
        if (!foundBooking) {
            revert('SmartStay: Not recipient of the booking');
        }
        _;
    }


    // Struct, Arrays, Enums

    struct Renting {
        uint256 id;
        uint128 unitPrice;
        uint128 caution;
        address owner;
        uint64 personCount;
        string location;
        string[] tags;
        string description;
        string imageURL;
    }

    struct Booking {
        uint256 id;
        uint256 rentingID;
        uint128 amountLocked;
        uint128 cautionLocked;
        uint64 timestampStart;
        uint64 timestampEnd;
        uint64 duration;
        uint64 personCount;
        bool validatedOwner;
        bool validatedRecipient;
        BookingStatus status;
    }

    enum BookingStatus {
        CREATED,
        REJECTED,
        WAITING_FOR_PAYMENT,
        ONGOING,
        VALIDATED,
        COMPLETED
    }

    // Constructor

    constructor() {
        // Create empty renting and booking to avoid issue with index 0
        Renting memory _renting;
        rentings.push(_renting);
        indexRenting.increment();

        Booking memory _booking;
        bookings.push(_booking);
        indexBooking.increment();
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
                    if (_maxPersonCount == 0 || rentings[i].personCount >= _maxPersonCount) {
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
        tempRenting.caution = _renting.caution;
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
     * @dev Get a renting from a booking ID
     * @param _bookingID Id of the booking to get the renting from
     * @return Renting matching the _bookingID passed in parameters
     */
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
    function createBooking(uint256 _rentingID, uint64 _timestampStart, uint64 _duration, uint64 _personCount) external {
        // require(msg.sender != rentings[_rentingID].owner, 'SmartStay : Can not create booking for your own rentings');
        // TODO DO NOT FORGET TO UNCOMMENT

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

    /**
     * @dev Approve the booking
     * @param _bookingID Id of booking to approve
     */
    function approveBooking(uint256 _bookingID) external isBookingOwner(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.CREATED, 'SmartStay : Wrong booking status');

        bookings[_bookingID].status = BookingStatus.WAITING_FOR_PAYMENT;
    }

    /**
     * @dev Reject the booking
     * @param _bookingID Id of booking to reject
     */
    function rejectBooking(uint256 _bookingID) external isBookingOwner(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.CREATED, 'SmartStay : Wrong booking status');

        bookings[_bookingID].status = BookingStatus.REJECTED;
    }

    /**
     * @dev Confirm a booking by locking (renting price * duration + caution) amount ETH for the duration of the booking
     * @param _bookingID Id of booking to confirm
     */
    function confirmBooking(uint256 _bookingID) external payable isBookingRecipient(_bookingID) {
        require(msg.value >= uint256(rentings[bookings[_bookingID].rentingID].unitPrice * bookings[_bookingID].duration + rentings[bookings[_bookingID].rentingID].caution) * 1 ether, 'SmartStay: Not enought send');
        require(bookings[_bookingID].status == BookingStatus.WAITING_FOR_PAYMENT, 'SmartStay : Wrong booking status');
        
        bookings[_bookingID].amountLocked = uint128(rentings[bookings[_bookingID].rentingID].unitPrice * bookings[_bookingID].duration) * 1 ether;
        bookings[_bookingID].cautionLocked = uint128(rentings[bookings[_bookingID].rentingID].caution) * 1 ether;

        bookings[_bookingID].status = BookingStatus.ONGOING;
    }

    function validateBookingAsRecipient(uint256 _bookingID) external isBookingRecipient(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.ONGOING, 'SmartStay : Wrong booking status');
        require(block.timestamp > bookings[_bookingID].timestampEnd, 'SmartStay : Booking is not finished yet');

        bookings[_bookingID].validatedRecipient = true;
        if (bookings[_bookingID].validatedOwner == true) {
            bookings[_bookingID].status = BookingStatus.VALIDATED;
        }
    }

        function validateBookingAsOwner(uint256 _bookingID) external isBookingOwner(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.ONGOING, 'SmartStay : Wrong booking status');
        require(block.timestamp > bookings[_bookingID].timestampEnd, 'SmartStay : Booking is not finished yet');

        bookings[_bookingID].validatedOwner = true;
        if (bookings[_bookingID].validatedRecipient == true) {
            bookings[_bookingID].status = BookingStatus.VALIDATED;
        }
    }

    /**
     * Retrieve caution as recipient of a booking
     * @param _bookingID Od of booking to retrieve caution
     */
    function retrieveCaution(uint256 _bookingID) external payable isBookingRecipient(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.VALIDATED, 'SmartStay : Wrong booking status');

        uint256 cautionToSend = bookings[_bookingID].cautionLocked;
        bookings[_bookingID].cautionLocked = 0;

        (bool success, ) = msg.sender.call{value: cautionToSend}("");
        require(success, 'SmartStay: Caution retrieve failed');
        if (bookings[_bookingID].amountLocked == 0) {
            bookings[_bookingID].status = BookingStatus.COMPLETED;
        }
    }

    /**
     * Retrieve amount as owner of a booking
     * @param _bookingID Od of booking to retrieve caution
     */
    function retrieveAmount(uint256 _bookingID) external payable isBookingOwner(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.VALIDATED, 'SmartStay : Wrong booking status');

        uint256 amountToSend = bookings[_bookingID].amountLocked;
        bookings[_bookingID].amountLocked = 0;

        (bool success, ) = msg.sender.call{value: amountToSend}("");
        require(success, 'SmartStay: Amount retrieve failed');
        if (bookings[_bookingID].cautionLocked == 0) {
            bookings[_bookingID].status = BookingStatus.COMPLETED;
        }
    }


    // Utils

    /**
     * @dev Returns all possible tags for a renting
     * @return All possible tags for a renting
     */
    function getTags() external view returns (string[] memory) {
        return tags;
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

    /**
     * @dev Check if two strings are equal
     * @param a First string to compare
     * @param b Second string to compare
     * @return True of both string are equal, false otherwise
     */
    function compareString(string memory a, string memory b) private pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}

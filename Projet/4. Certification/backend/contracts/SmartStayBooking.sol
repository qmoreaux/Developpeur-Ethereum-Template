// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";

import "./SmartStayNFTCollection.sol";
import "./SmartStaySBTCollection.sol";
import "./SmartStayDIDCollection.sol";

import "./SmartStayRenting.sol";

/** 
 * @title SmartStayBooking
 * @author Quentin Moreaux
 * @dev Implements core functionnalities for SmartStay Dapp
 */
contract SmartStayBooking {

    using Counters for Counters.Counter;

    // State Variables

    SmartStayRenting smartStayRenting;

    SmartStayNFTCollection NFTCollection;
    SmartStaySBTCollection SBTCollection;
    SmartStayDIDCollection DIDCollection;

    Counters.Counter private indexBooking;
    Counters.Counter private indexRating;

    Booking[] bookings;
    mapping(address => uint[]) bookingRecipient; // mapping to array of booking id (as recipient)
    mapping(address => uint[]) bookingOwner; // mapping to array of booking id (as owner)

    mapping(address => Rating[]) ratings;

    bool demoMode; // Used to avoid certain checks to make demo easier

    // Events 

    event BookingCreated(Booking booking);
    event BookingUpdated(Booking booking);

    event RatingCreated(Rating rating);

    // Modifiers

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


    // Struct, Enums

    struct Rating {
        uint256 id;
        address from;
        uint8 note;
        bool owner;
        string comment;
    }

    struct Booking {
        uint256 id;
        uint256 rentingID;
        uint128 amountLocked;
        uint128 depositLocked;
        uint64 timestampStart;
        uint64 timestampEnd;
        uint64 duration;
        uint64 personCount;
        uint256 SBTOwnerID;
        uint256 SBTRecipientID;
        uint256 NFTRecipientID;
        bool validatedOwner;
        bool validatedRecipient;
        bool NFTRedeemed;
        bool ratedOwner;
        bool ratedRecipient;
        address recipient;
        BookingStatus status;
    }

    enum BookingStatus {
        CREATED,
        WAITING_FOR_PAYMENT,
        ONGOING,
        VALIDATED,
        COMPLETED,
        REJECTED,
        CANCELLED
    }

    // Constructor
    
    constructor(address _address, bool _demoMode) {

        NFTCollection = new SmartStayNFTCollection();
        SBTCollection = new SmartStaySBTCollection();
        DIDCollection = new SmartStayDIDCollection();

        smartStayRenting = SmartStayRenting(_address);

        demoMode = _demoMode;

        Booking memory _booking;
        bookings.push(_booking);
        indexBooking.increment();

        indexRating.increment();
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
        require(msg.sender != smartStayRenting.getRenting(_rentingID).owner || demoMode, 'SmartStay : Can not create booking for your own rentings');
        require (block.timestamp < _timestampStart || demoMode, 'SmartStay : Can not create a booking in the past');
        require (smartStayRenting.getRenting(_rentingID).personCount >= _personCount, 'SmartStay : Too many persons for this renting');

        Booking memory _booking;
        _booking.id = indexBooking.current();
        _booking.recipient = msg.sender;
        _booking.rentingID = _rentingID;
        _booking.timestampStart = _timestampStart;
        _booking.duration = _duration;
        _booking.timestampEnd = _timestampStart + _duration * 1 days - 1;
        _booking.personCount = _personCount;

        bookings.push(_booking);
        bookingOwner[smartStayRenting.getRenting(_rentingID).owner].push(indexBooking.current());
        bookingRecipient[msg.sender].push(indexBooking.current());

        indexBooking.increment();

        emit BookingCreated(_booking);
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
     * Get a booking from its ID
     * @param _bookingID Booking of the id to get
     * @return Booking matching the id passed in parameters
     */
    function getBooking(uint256 _bookingID) external view returns (Booking memory) {
        return bookings[_bookingID];
    }

    /**
     * @dev Get a renting from a booking ID
     * @param _bookingID Id of the booking to get the renting from
     * @return Renting matching the _bookingID passed in parameters
     */
    function getRentingFromBookingID(uint _bookingID) public view returns (SmartStayRenting.Renting memory) {
        return smartStayRenting.getRenting(bookings[_bookingID].rentingID);
    }

    /**
     * @dev Approve the booking
     * @param _bookingID Id of booking to approve
     */
    function approveBooking(uint256 _bookingID) external isBookingOwner(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.CREATED, 'SmartStay : Wrong booking status');

        bookings[_bookingID].status = BookingStatus.WAITING_FOR_PAYMENT;

        emit BookingUpdated(bookings[_bookingID]);
    }

    /**
     * @dev Reject the booking
     * @param _bookingID Id of booking to reject
     */
    function rejectBooking(uint256 _bookingID) external isBookingOwner(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.CREATED, 'SmartStay : Wrong booking status');

        bookings[_bookingID].status = BookingStatus.REJECTED;

        emit BookingUpdated(bookings[_bookingID]);
    }

    /**
     * @dev Confirm a booking by locking (renting price * duration + deposit) amount ETH for the duration of the booking
     * @param _bookingID Id of booking to confirm
     */
    function confirmBooking(uint256 _bookingID, string calldata _ownerMetadataURI, string calldata _recipientMetadataURI) external payable isBookingRecipient(_bookingID) {
        require(msg.value >= uint256(smartStayRenting.getRenting(bookings[_bookingID].rentingID).unitPrice * bookings[_bookingID].duration + smartStayRenting.getRenting(bookings[_bookingID].rentingID).deposit), 'SmartStay: Not enough sent');
        require(bookings[_bookingID].status == BookingStatus.WAITING_FOR_PAYMENT, 'SmartStay : Wrong booking status');
        
        bookings[_bookingID].amountLocked = uint128(smartStayRenting.getRenting(bookings[_bookingID].rentingID).unitPrice * bookings[_bookingID].duration);
        bookings[_bookingID].depositLocked = uint128(smartStayRenting.getRenting(bookings[_bookingID].rentingID).deposit);

        bookings[_bookingID].SBTOwnerID = SBTCollection.mint(smartStayRenting.getRenting(bookings[_bookingID].rentingID).owner, _ownerMetadataURI, bookings[_bookingID].duration, bookings[_bookingID].amountLocked, _bookingID);
        bookings[_bookingID].SBTRecipientID = SBTCollection.mint(msg.sender, _recipientMetadataURI, bookings[_bookingID].duration, bookings[_bookingID].amountLocked, _bookingID);

        bookings[_bookingID].status = BookingStatus.ONGOING;

        emit BookingUpdated(bookings[_bookingID]);
    }

    /**
     * @dev Validate a booking as owner of the booking
     * @param _bookingID Id of the booking to validate as owner
     */
    function validateBookingAsOwner(uint256 _bookingID) external isBookingOwner(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.ONGOING, 'SmartStay : Wrong booking status');
        require(block.timestamp > bookings[_bookingID].timestampEnd, 'SmartStay : Booking is not finished yet');
        require(!bookings[_bookingID].validatedOwner, 'SmartStay : Booking already validated by owner');

        bookings[_bookingID].validatedOwner = true;
        if (bookings[_bookingID].validatedRecipient == true) {
            bookings[_bookingID].status = BookingStatus.VALIDATED;
        }

        emit BookingUpdated(bookings[_bookingID]);
    }

    /**
     * @dev Validate a booking as recipient of the booking
     * @param _bookingID Id of the booking to validate as recipient
     */
    function validateBookingAsRecipient(uint256 _bookingID) external isBookingRecipient(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.ONGOING, 'SmartStay : Wrong booking status');
        require(block.timestamp > bookings[_bookingID].timestampEnd, 'SmartStay : Booking is not finished yet');
        require(!bookings[_bookingID].validatedRecipient, 'SmartStay : Booking already validated by recipient');

        bookings[_bookingID].validatedRecipient = true;
        if (bookings[_bookingID].validatedOwner == true) {
            bookings[_bookingID].status = BookingStatus.VALIDATED;
        }

        emit BookingUpdated(bookings[_bookingID]);
    }

    /**
     * Retrieve deposit as recipient of a booking
     * @param _bookingID Id of booking to retrieve deposit
     */
    function retrieveDeposit(uint256 _bookingID, string memory _newTokenURI) external isBookingRecipient(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.VALIDATED, 'SmartStay : Wrong booking status');

        uint256 depositToSend = bookings[_bookingID].depositLocked;
        bookings[_bookingID].depositLocked = 0;

        (bool success, ) = msg.sender.call{value: depositToSend}("");
        require(success, 'SmartStay: Deposit retrieve failed');

        SBTCollection.update(bookings[_bookingID].SBTRecipientID, _newTokenURI, getRentingFromBookingID(_bookingID).location, msg.sender);
        if (bookings[_bookingID].amountLocked == 0) {
            bookings[_bookingID].status = BookingStatus.COMPLETED;
        }

        emit BookingUpdated(bookings[_bookingID]);
    }

    /**
     * Retrieve amount as owner of a booking
     * @param _bookingID Id of booking to retrieve deposit
     */
    function retrieveAmount(uint256 _bookingID, string memory _newTokenURI) external isBookingOwner(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.VALIDATED, 'SmartStay : Wrong booking status');

        uint256 amountToSend = bookings[_bookingID].amountLocked;
        bookings[_bookingID].amountLocked = 0;

        (bool success, ) = msg.sender.call{value: amountToSend}("");
        require(success, 'SmartStay: Amount retrieve failed');
        
        SBTCollection.update(bookings[_bookingID].SBTOwnerID, _newTokenURI, getRentingFromBookingID(_bookingID).location, msg.sender);
        if (bookings[_bookingID].depositLocked == 0) {
            bookings[_bookingID].status = BookingStatus.COMPLETED;
        }

        emit BookingUpdated(bookings[_bookingID]);
    }

    /**
     * Cancel booking as recipient of the booking
     * @param _bookingID Id of booking to cancel
     */
    function cancelBooking(uint256 _bookingID) external isBookingRecipient(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.ONGOING, 'SmartStay : Wrong booking status');
        require(block.timestamp < bookings[_bookingID].timestampStart, 'SmartStay : Can not cancel booking already started');

        uint256 amountToSend = bookings[_bookingID].amountLocked + bookings[_bookingID].depositLocked;
        bookings[_bookingID].amountLocked = 0;
        bookings[_bookingID].depositLocked = 0;

        (bool success, ) = msg.sender.call{value: amountToSend}("");
        require(success, 'SmartStay: Amount retrieve failed');

        if (bookings[_bookingID].NFTRecipientID != 0) {
            NFTCollection.burn(bookings[_bookingID].NFTRecipientID);
            bookings[_bookingID].NFTRecipientID = 0;
        }
        SBTCollection.burn(bookings[_bookingID].SBTRecipientID);
        SBTCollection.burn(bookings[_bookingID].SBTOwnerID);
        bookings[_bookingID].SBTRecipientID = 0;
        bookings[_bookingID].SBTOwnerID = 0;

        bookings[_bookingID].status = BookingStatus.CANCELLED;

        emit BookingUpdated(bookings[_bookingID]);
    }

    // Rating

    /**
     * @dev Rate the owner of a booking after it is completed
     * @param _bookingID ID of the booking to rate the owner from
     * @param _note Note to give to the owner
     * @param _comment Comment to add to the rating
     */
    function rateOwner(uint256 _bookingID, uint8 _note, string memory _comment) external isBookingRecipient(_bookingID)  {
        require(bookings[_bookingID].status == BookingStatus.COMPLETED, 'SmartStay : Wrong booking status');
        require(!bookings[_bookingID].ratedOwner, 'SmartStay: Already rated owner for this booking');

        Rating memory _rating;
        _rating.id = indexRating.current();
        _rating.from = msg.sender;
        _rating.note = _note;
        _rating.owner = true;
        _rating.comment = _comment;
        ratings[getRentingFromBookingID(_bookingID).owner].push(_rating); 

        indexRating.increment();

        bookings[_bookingID].ratedOwner = true;

        emit RatingCreated(_rating);
        emit BookingUpdated(bookings[_bookingID]);
    }

    /**
     * @dev Rate the recipient of a booking after it is completed
     * @param _bookingID ID of the booking to rate the recipient from
     * @param _note Note to give to the recipient
     * @param _comment Comment to add to the rating
     */
    function rateRecipient(uint256 _bookingID, uint8 _note, string memory _comment) external isBookingOwner(_bookingID) {
        require(bookings[_bookingID].status == BookingStatus.COMPLETED, 'SmartStay : Wrong booking status');
        require(!bookings[_bookingID].ratedRecipient, 'SmartStay: Already rated recipient for this booking');

        Rating memory _rating;
        _rating.id = indexRating.current();
        _rating.from = msg.sender;
        _rating.note = _note;
        _rating.owner = false;
        _rating.comment = _comment;
        ratings[bookings[_bookingID].recipient].push(_rating);

        indexRating.increment();

        bookings[_bookingID].ratedRecipient = true;

        emit RatingCreated(_rating);
        emit BookingUpdated(bookings[_bookingID]);
    }

    /**
     * @dev Get all ratings for an address
     * @param _address Address of the user to get the ratings
     * @return Array of ratings for the user
     */
    function getRating(address _address) external view returns (Rating[] memory) {
        return ratings[_address];
    }
    
    // NFT & SBT && DID

    /**
     * @return Address of the NFTCollection
     */
    function getNFTCollection() public view returns (address) {
        return address(NFTCollection);
    }

    /**
     * @return Address of the SBTCollection
     */
    function getSBTCollection() public view returns (address) {
        return address(SBTCollection);
    }

    /**
     * @return Address of the DIDCollection
     */
    function getDIDCollection() public view returns (address) {
        return address(SBTCollection);
    }

    /**
     * @dev Get all NFT for an address
     * @param _address Adress to get the NFT from
     * @return Array of SmartStayNFT
     */
    function getUserNFT(address _address) public view returns (SmartStayNFTCollection.SmartStayNFT[] memory) {
        return NFTCollection.getUserNFT(_address);
    }

    /**
     * @dev Get all SBT for an address
     * @param _address Adress to get the SBT from
     * @return Array of SmartStaySBT
     */
    function getUserSBT(address _address) public view returns (SmartStaySBTCollection.SmartStaySBT[] memory) {
        return SBTCollection.getUserSBT(_address);
    }

    /**
     * @dev Get all DID for an address
     * @param _address Adress to get the DID from
     * @return A single SmartStayDID
     */
    function getUserDID(address _address) public view returns (SmartStayDIDCollection.SmartStayDID memory) {
        return DIDCollection.getUserDID(_address);
    }

    /**
     * @dev Create a DID for a user
     * @param to Address to mint the DID for
     * @param _tokenURI URI of the DID metadata
     * @param _firstname Firstname of the user
     * @param _lastname Lastname of the user
     * @param _email Email of the user
     * @param _registeringNumber Registering number of the user
     */
    function createDID(address to, string memory _tokenURI, string memory _firstname, string memory _lastname, string memory _email, uint256 _registeringNumber) external {
        DIDCollection.mint(to, _tokenURI, _firstname, _lastname, _email, _registeringNumber);
    }

    /**
     * @dev Mint an NFT for the recipient of a booking
     * @param _bookingID Id of the booking
     * @param _metadataURI URI of the metadata of the NFT to mint
     */
    function redeemNFT(uint256 _bookingID, string calldata _metadataURI) external isBookingRecipient(_bookingID) {
        require (!bookings[_bookingID].NFTRedeemed, 'SmartStay: NFT already redeemed');

        bookings[_bookingID].NFTRecipientID = NFTCollection.mint(msg.sender, _metadataURI);
        bookings[_bookingID].NFTRedeemed = true;

        emit BookingUpdated(bookings[_bookingID]);
    }
}

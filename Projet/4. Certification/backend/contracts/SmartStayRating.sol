// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";

import "./libraries/Tokens.sol";

import "./SmartStayRenting.sol";
import "./SmartStayBooking.sol";

/** 
 * @title Voting
 * @author Quentin Moreaux
 * @dev Implements functionnalities for SmartStay Dapp
 */
contract SmartStay {

    SmartStayRenting smartStayRenting;
    SmartStayBooking smartStayBooking;

    using Counters for Counters.Counter;

    // State Variables

    Counters.Counter private index;

    mapping(address => Rating[]) ratings;

    // Events 

    event RatingCreated(Rating rating);

    // Modifiers



    // Struct, Arrays, Enums

    struct Rating {
        address from;
        uint8 note;
        bool owner;
        string comment;
    }


    // Constructor

    constructor(address _addressRenting, address _addressBooking) {

        smartStayRenting = SmartStayRenting(_addressRenting);
        smartStayBooking = SmartStayBooking(_addressBooking);
    }


    function rateOwner(uint256 _bookingID, uint8 _note, string memory _comment) external  {
        require(smartStayBooking.getBooking(_bookingID).status == SmartStayBooking.BookingStatus.COMPLETED, 'SmartStay : Wrong booking status');
        require(!smartStayBooking.getBooking(_bookingID).ratedOwner, 'SmartStay: Already rated owner for this booking');

        Rating memory _rating;
        _rating.from = msg.sender;
        _rating.note = _note;
        _rating.owner = false;
        _rating.comment = _comment;

        // ratings[rentings[bookings[_bookingID].rentingID].owner].push(_rating);  // TO CHECK

        smartStayBooking.getBooking(_bookingID).ratedOwner = true;

        emit RatingCreated(_rating);
    }

    function rateRecipient(uint256 _bookingID, uint8 _note, string memory _comment) external {
        require(smartStayBooking.getBooking(_bookingID).status == SmartStayBooking.BookingStatus.COMPLETED, 'SmartStay : Wrong booking status');
        require(!smartStayBooking.getBooking(_bookingID).ratedRecipient, 'SmartStay: Already rated recipient for this booking');

        Rating memory _rating;
        _rating.from = msg.sender;
        _rating.note = _note;
        _rating.owner = true;
        _rating.comment = _comment;

        ratings[smartStayBooking.getBooking(_bookingID).recipient].push(_rating);

        smartStayBooking.getBooking(_bookingID).ratedRecipient = true; // TO CHECK

        emit RatingCreated(_rating);
    }

    function getRating(address _address) external view returns (Rating[] memory) {
        return ratings[_address];
    }

}

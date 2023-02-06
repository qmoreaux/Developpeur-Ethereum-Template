// SPDX-License-Identifier: GPL-3.0


// Using latest version as of 2023-02-06
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

/** 
 * @title Voting
 * @dev Implements a simple voting system
 */
contract Voting is Ownable {

    // Listing required event, enum and struct
    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
        }

    struct Proposal {
        string description;
        uint voteCount;
    }

    // Only whitelisted Voter can submit proposal and vote
    mapping(address => bool) whitelist;

    WorkflowStatus workflowStatus;

    // Stocking all proposal in an array;
    Proposal[] proposal;

    // modifier to check if caller is whitelisted
    modifier isWhitelisted() {
        require(whitelist[msg.sender], "You are not whitelisted");
        _;
    }

    /** 
     * @dev
     * @param
     */
    function addToWhitelist(address _address) external onlyOwner {

    }

    /** 
     * @dev
     * @param
     */
    function startProposingSession() external onlyOwner {

    }

    /** 
     * @dev
     * @param
     */
    function submitProposal(Proposal memory _proposal) external isWhitelisted {

    }

    /** 
     * @dev
     * @param
     */
    function endProposalSession() external onlyOwner {

    }

    /** 
     * @dev
     * @param
     */
    function startVotingSession() external onlyOwner {

    }

    /** 
     * @dev
     * @param
     */
    function submitVote() external isWhitelisted {

    }

    /** 
     * @dev
     * @param
     */
    function endVotingSession() external onlyOwner {

    }

    /** 
     * @dev
     * @param
     */
    function tallyingVote() external onlyOwner {

    }

    /** 
     * @dev
     * @param
     */
    function getWinner() external {

    }

}
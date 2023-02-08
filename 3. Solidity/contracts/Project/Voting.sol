// SPDX-License-Identifier: GPL-3.0


// Using latest version as of 2023-02-06
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

/** TODO
 *
 * Vérifier visibilité des fonctions
 */

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

    WorkflowStatus workflowStatus; // No need to init since it will take the first value by default
    Proposal[] proposals; // Stocking proposals in a dynamic array so we can iterate on it
    mapping(address => Voter) voters; // Stocking voters in a mapping since there is no need to iterate on it

    // modifier to check if caller is registered
    modifier isWhitelisted() {
        require(voters[msg.sender].isRegistered, "You are not whitelisted");
        _;
    }

    /** 
     * @dev Create a new Voter from an address and register him, to allow him to submit proposals and votes
     * @param _address Address of the voter we wish to register
     */
    function addToWhitelist(address _address) external onlyOwner {
        require(!voters[_address].isRegistered, "Voter already registered"); // Checking that the voters isn't already registred
        voters[_address] = Voter(true, false, 0);
    }

    /** 
     * @dev Start the proposing session
     */
    function startProposingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "The current status isn't RegisteringVoters");
        incrementWorkflowStatus();
    }

    /** 
     * @dev Used to submit proposal by passing directy a Proposal struct
     * @param _proposal The Proposal struct the user want to submit
     */
    function submitProposal(Proposal memory _proposal) external isWhitelisted {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "The current status isn't ProposalsRegistrationStarted");
        require(_proposal.voteCount == 0, "Can't submit a proposal with an initial voteCount superior to 0");
        require(bytes(_proposal.description).length > 0, "Can't submit a proposal with an empty description"); // We need to convert the description to bytes to check its length

        proposals.push(_proposal);
    }

    /** 
     * @dev Used to submit proposal by passing only a description
     * @param _description The description for the proposal the user want to submit
     */
    function submitProposal(string memory _description) external isWhitelisted {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "The current status isn't ProposalsRegistrationStarted");
        require(bytes(_description).length > 0, "Can't submit a proposal with an empty description"); // We need to convert the description to bytes to check its length
        
        proposals.push(Proposal(_description, 0));
    }

    /** 
     * @dev End the proposing session
     */
    function endProposalSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "The current status isn't ProposalsRegistrationStarted");
        require(proposals.length > 2, "There isn't enough proposal yet (minimum 2 required");

        incrementWorkflowStatus();
    }

    /** 
     * @dev Get all proposals as an array
     */
    function getListedProposal() external view isWhitelisted returns (Proposal[] memory) {
        return proposals;
    }

    /** 
     * @dev Get all proposals as a string
     */
    function getListedProposalAsString() external view isWhitelisted returns (string memory) { // TODO Currently here
        return "";
    }

    /** 
     * @dev
     * @param
     */
    function startVotingSession() external onlyOwner {
        // TODO List and implement check

    }

    /** 
     * @dev
     * @param
     */
    function submitVote() external isWhitelisted {
        // TODO List and implement check

    }

    /** 
     * @dev
     * @param
     */
    function endVotingSession() external onlyOwner {
        // TODO List and implement check

    }

    /** 
     * @dev
     * @param
     */
    function tallyingVote() external onlyOwner {
        // TODO List and implement check

    }

    /** 
     * @dev
     * @param
     */
    function getWinner() external {
        // TODO List and implement check

    }

    /** 
     * @dev
     * @param
     */
    function incrementWorkflowStatus() private {
        emit WorkflowStatusChange(workflowStatus, WorkflowStatus(uint(workflowStatus) + 1));
        workflowStatus = WorkflowStatus(uint(workflowStatus) + 1);
    }
}
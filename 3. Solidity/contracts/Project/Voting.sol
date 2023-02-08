// SPDX-License-Identifier: GPL-3.0


// Using latest version as of 2023-02-06
pragma solidity 0.8.18;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol";

/** TODO
 *
 * Vérifier visibilité des fonctions
 * Check emit event
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

    constructor() {
        voters[msg.sender] = Voter(true, false, 0);
        proposals.push(Proposal("Default proposal", 0));
    }

    /** 
     * @dev Create a new Voter from an address and register him, to allow him to submit proposals and votes
     * @param _address Address of the voter we wish to register
     */
    function addToWhitelist(address _address) external onlyOwner {
        require(!voters[_address].isRegistered, "Voter already registered"); // Checking that the voters isn't already registred

        voters[_address] = Voter(true, false, 0);
        emit VoterRegistered(_address);
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
        require(!alreadySubmitedProposal(_proposal.description), "This proposal has already been submited");

        proposals.push(_proposal);
        emit ProposalRegistered(proposals.length - 1);
    }

    /** 
     * @dev Used to submit proposal by passing only a description
     * @param _description The description for the proposal the user want to submit
     */
    function submitProposal(string memory _description) external isWhitelisted {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "The current status isn't ProposalsRegistrationStarted");
        require(bytes(_description).length > 0, "Can't submit a proposal with an empty description"); // We need to convert the description to bytes to check its length
        require(!alreadySubmitedProposal(_description), "This proposal has already been submited");

        proposals.push(Proposal(_description, 0));
    }

    /** 
     * @dev End the proposing session
     */
    function endProposalSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "The current status isn't ProposalsRegistrationStarted");
        require(proposals.length > 2, "There isn't enough proposal yet (minimum 2 required (not counting default proposal))");

        incrementWorkflowStatus();
    }

    /** 
     * @dev Get all proposals as an array
     * @return Array of proposals
     */
    function getListedProposal() external view isWhitelisted returns (Proposal[] memory) {
        return proposals;
    }

    /** 
     * @dev Start the voting session
     */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, "The current status isn't ProposalsRegistrationEnded");

        incrementWorkflowStatus();
    }

    /** 
     * @dev
     * @param
     */
    function submitVote(uint _proposalId) external isWhitelisted { // TODO Currently here
        // TODO List and implement check

    }

    /** 
     * @dev
     * @param
     */
    function endVotingSession() private onlyOwner {
        // TODO List and implement check

    }

    /** 
     * @dev
     * @param
     */
    function tallyingVote() private onlyOwner {
        // TODO List and implement check

    }

    /** 
     * @dev
     * @param
     */
    function getWinner() private isWhitelisted {
        // TODO List and implement check

    }

    /** 
     * @dev Return the votedProposalId of a voter
     * @param _addr Address of the voter we want to get the votedProposalId
     * @return The votedProposalId of the address passed in parameters
     */
    function getVoteFromAddress(address _addr) external view isWhitelisted returns (uint) {
        return voters[_addr].votedProposalId;
    }

    /** 
     * @dev Go to the next step of the workflow
     */
    function incrementWorkflowStatus() private {
        emit WorkflowStatusChange(workflowStatus, WorkflowStatus(uint(workflowStatus) + 1));
        workflowStatus = WorkflowStatus(uint(workflowStatus) + 1);
    }

    /** 
     * @dev Check if a proposal has already been submitted
     * @param _description The description for the proposal the user want to submit
     * @return A boolean that indicates if the proposal has already been submitted
     */
    function alreadySubmitedProposal(string memory _description) private view returns (bool) {
        for (uint i = 0; i < proposals.length; i++) {
            if (Strings.equal(_description, proposals[i].description)) {
                return true;
            }
        }
        return false;
    }
}
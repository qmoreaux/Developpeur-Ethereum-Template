// SPDX-License-Identifier: GPL-3.0

// Using latest version as of 2023-02-06
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

/** 
 * @title Voting
 * @dev Implements a simple voting system
 */
contract Voting is Ownable {

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
    Proposal[] proposals; // Stocking proposals in dynamic array so we can iterate on it
    Proposal[] winningProposals; // Using dynamic array in case of a tie
    mapping(address => Voter) voters; // Stocking voters in mapping since there is no need to iterate on it


    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);


    /** 
     * @dev Add the owner to the whitelist and add a default proposal to the list
     */
    constructor() {
        addToWhitelist(msg.sender);
        proposals.push(Proposal("Default proposal", 0));
        winningProposals.push(Proposal("Default proposal", 0));
    }


    /** 
     * @dev Modifier to check if caller is registered
     */
    modifier isWhitelisted() {
        require(voters[msg.sender].isRegistered, "You are not whitelisted");
        _;
    }


    /** 
     * @dev Create a new Voter from an address and register him, to allow him to submit proposals and votes
     * @param _address Address of the voter we wish to register
     */
    function addToWhitelist(address _address) public onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "The current status isn't RegisteringVoters");
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
    function submitProposal(Proposal calldata _proposal) public isWhitelisted {
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
    function submitProposal(string calldata _description) external isWhitelisted {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "The current status isn't ProposalsRegistrationStarted");
        require(bytes(_description).length > 0, "Can't submit a proposal with an empty description"); // We need to convert the description to bytes to check its length
        require(!alreadySubmitedProposal(_description), "This proposal has already been submited");

        proposals.push(Proposal(_description, 0));

        emit ProposalRegistered(proposals.length - 1);
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
     * @dev Submit a vote for a proposal
     * @param _proposalId Id of the proposal the user wish to vote for
     */
    function submitVote(uint _proposalId) external isWhitelisted {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "The current status isn't VotingSessionStarted");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_proposalId > 0, "You can not vote for the default proposal");
        require(_proposalId < proposals.length, "This proposal doesn't exist");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;

        emit Voted(msg.sender, _proposalId);
    }

    /** 
     * @dev End the voting session
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "The current status isn't VotingSessionStarted");
        require(minimumOneVote(), "No one has voted yet");

        incrementWorkflowStatus();
    }

    /** 
     * @dev Determinate the winningProposal(s) according to their votecount
     */
    function tallyingVote() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "The current status isn't VotingSessionEnded");

        for (uint i = 1 ; i < proposals.length ; i++) { // Starting at index 1 to ignore the default proposal
            if (proposals[i].voteCount > winningProposals[0].voteCount) {
                delete winningProposals;
                winningProposals.push(proposals[i]);
            } else if (proposals[i].voteCount == winningProposals[0].voteCount) {
                winningProposals.push(proposals[i]);
            }
        }

        incrementWorkflowStatus();
    }

    /** 
     * @dev Return the wining proposal(s)
     */
    function getWinner() external view returns (Proposal[] memory) { // No modifier since everyone can view the winning proposal(s)
        require(workflowStatus == WorkflowStatus.VotesTallied, "The current status isn't VotesTallied");

        return winningProposals;
    }

    /** 
     * @dev Return the votedProposalId of a voter
     * @param _addr Address of the voter we want to get the votedProposalId
     * @return The votedProposalId of the address passed in parameters
     */
    function getVoteFromAddress(address _addr) external view isWhitelisted returns (uint) {
        require(voters[_addr].votedProposalId != 0, "This user hasn't voted yet");

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
    function alreadySubmitedProposal(string calldata _description) private view returns (bool) {
        for (uint i = 0; i < proposals.length ; i++) {
            if (keccak256(bytes(_description)) == keccak256(bytes(proposals[i].description))) {
                return true;
            }
        }

        return false;
    }

    /** 
     * @dev Check if at least a vote has been submitted
     * @return A boolean that indicates if at least one vote has been submitted
     */
    function minimumOneVote() private view returns (bool) {
        for (uint i = 0 ; i < proposals.length ; i++) {
            if (proposals[i].voteCount > 0) {
                return true;
            }
        }

        return false;
    }
}

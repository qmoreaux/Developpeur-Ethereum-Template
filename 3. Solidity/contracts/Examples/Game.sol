// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol";

contract Game is Ownable {

    string word;
    string clues;

    uint index;

    mapping(address => bool) players;

    address winner;

    function setWordAndClues(string memory _word, string memory _clues) external onlyOwner {
        word = _word;
        clues = _clues;
    }

    function getClues() external view returns (string memory) {
        return clues;
    }

    function proposeWord(string memory _word ) external returns (bool) {
        require(bytes(word).length > 0 && bytes(clues).length > 0, "Not init");
        require(!players[msg.sender], "You have already played");
        require(winner == address(0), "Someone has already won");

        players[msg.sender] = true;
        if (Strings.equal(word, _word)) {
            winner = msg.sender;
            return true;
        } else {
            return false;
        }
    }

    function getWinner() external view returns (address) {
        return winner;
    }

    function restartGame() external onlyOwner() {
        delete word;
        delete clues;
        delete winner;
        index++;
    }

}

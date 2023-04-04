// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

library Utils {

    /**
     * @dev Check if the renting contains tags
     * @param tags Tags of renting to iterate
     * @param _tags Tags to check
     * @return All rentings that contains all the tags
     */
    function containTags(string[] memory tags, string[] memory _tags) public pure returns (bool) {
        for (uint i; i < _tags.length; i++) {
            bool tagFound;
            for (uint j; j < tags.length; j++) {
                if (compareString(tags[j], _tags[i])) {
                    tagFound = true;
                }
            }
            if (!tagFound) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Check if two strings are equal
     * @param a First string to compare
     * @param b Second string to compare
     * @return True of both string are equal, false otherwise
     */
    function compareString(string memory a, string memory b) public pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
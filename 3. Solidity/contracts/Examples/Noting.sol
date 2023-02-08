// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol";

contract Game {

    struct Student {
        string name;
        uint noteBiology;
        uint noteMath;
        uint noteFr;
    }

    Student[] students;

    function isTeacher() private view returns (bool) {
        return msg.sender == 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 ||
        msg.sender == 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
    }

    function studentAlreadyExists(string memory _name) private view returns (bool) {
        for (uint i = 0; i < students.length; i++) {
            if (Strings.equal(students[i].name, _name)) {
                return true;
            }
        }
        return false;
    }

        function getStudent(string memory _name) private view returns (Student memory) {
        for (uint i = 0; i < students.length; i++) {
            if (Strings.equal(students[i].name, _name)) {
                return students[i];
            }
        }
        return Student("", 0, 0, 0);
    }

    function addNote(string memory _name, uint _noteBiology, uint _noteMath, uint _noteFr) external {
        if (studentAlreadyExists(_name)) {
            getStudent(_name).noteBiology = _noteBiology;
            getStudent(_name).noteMath = _noteMath;
            getStudent(_name).noteFr = _noteFr;
        } else {
            students.push(Student(_name, _noteBiology, _noteMath, _noteFr));
        }
    }

    function getNote(string memory _name) external view returns (Student memory) {
        require(studentAlreadyExists(_name), "Student does not exists");
        return getStudent(_name);
    }

    function getAverageStudent(string memory _name) external view returns (uint) {
        require(studentAlreadyExists(_name), "Student does not exists");
        Student memory student = getStudent(_name);
        return (student.noteBiology + student.noteMath + student.noteFr) / 3;
    }

    function getAverageBiology() external view returns (uint) {
        uint noteTotal;

        for (uint i = 0; i < students.length; i++) {
            noteTotal += students[i].noteBiology;
        }
        return noteTotal / students.length;
    }

    function getAverageMath() external view returns (uint) {
        uint noteTotal;

        for (uint i = 0; i < students.length; i++) {
            noteTotal += students[i].noteMath;
        }
        return noteTotal / students.length;
    }

     function getAverageFr() external view returns (uint) {
        uint noteTotal;

        for (uint i = 0; i < students.length; i++) {
            noteTotal += students[i].noteFr;
        }
        return noteTotal / students.length;
    }

    function getAverageGlobal() external view returns (uint) {
        uint noteTotal;

        for (uint i = 0; i < students.length; i++) {
            noteTotal += students[i].noteBiology;
            noteTotal += students[i].noteMath;
            noteTotal += students[i].noteFr;
        }

        return noteTotal / students.length / 3;
    }

}

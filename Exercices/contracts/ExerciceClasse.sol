// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

contract ExerciceClasse {

    struct Etudiant {
        string nom;
        uint note;
    }

    enum Classe {
        SIXIEME,
        CINQUIEME,
        QUATRIEME
    }

    Etudiant[] public etudiantsArray;
    mapping (address => Etudiant) public etudiantsMap;

    Classe public classe;

    function getEtudiantArray(uint index) public view returns (Etudiant memory) {
        return etudiantsArray[index];
    }

    function getEtudiantsMapping(address _addr) public view returns (Etudiant memory) {
        return etudiantsMap[_addr];
    }

    function setEtudiant(string memory _nom, uint _note, address _addr ) public {

        Etudiant memory tmp = Etudiant(_nom, _note);

        etudiantsArray.push(tmp);
        etudiantsMap[_addr] = tmp;
    }

    function deleteEtudiant(address _addr) public {
        delete etudiantsMap[_addr];
    }

    function setClass(Classe _classe) public {
        classe = _classe;
    }
    
}
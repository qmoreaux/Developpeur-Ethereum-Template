const ExerciceClasse = artifacts.require('./ExerciceClasse.sol');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('ExerciceClasse', async (accounts) => {
    const _nom = 'Jean';
    const _note = 20;
    const _addr = accounts[1];

    before(async function () {
        exerciceClasseInstance = await ExerciceClasse.deployed();
        await exerciceClasseInstance.setEtudiant(_nom, _note, _addr);
    });

    it('should get a student from array', async () => {
        const etudiant = await exerciceClasseInstance.getEtudiantArray.call(0);

        expect(etudiant.nom).to.be.equal(_nom);
        expect(etudiant.note).to.be.bignumber.equal(BN(_note));
    });

    it('should get a student from mapping', async () => {
        const etudiant = await exerciceClasseInstance.getEtudiantsMapping.call(_addr);

        expect(etudiant.nom).to.be.equal(_nom);
        expect(etudiant.note).to.be.bignumber.equal(BN(_note));
    });

    it('should delete a student from mapping', async () => {
        await exerciceClasseInstance.deleteEtudiant(_addr);

        const deletedEtudiant = await exerciceClasseInstance.getEtudiantsMapping.call(_addr);

        expect(deletedEtudiant.nom).to.be.equal('');
        expect(deletedEtudiant.note).to.be.bignumber.equal(BN(0));
    });

    it('should set class', async () => {
        await exerciceClasseInstance.setClass(1);

        expect(await exerciceClasseInstance.classe.call()).to.be.bignumber.equal(BN(1));
    });
});

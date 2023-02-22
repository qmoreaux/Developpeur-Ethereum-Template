const ExerciceClasse = artifacts.require('ExerciceClasse');

module.exports = async (deployer) => {
    deployer.deploy(ExerciceClasse);
};

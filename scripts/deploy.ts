import { ethers } from "hardhat";

async function main() {
  // Récupérer les signers depuis Hardhat
  const [deployer] = await ethers.getSigners();
  console.log("Déploiement avec l'adresse :", deployer.address);

  // Récupérer la factory du contrat
  const Voting = await ethers.getContractFactory("Voting");
  // Déployer le contrat
  const voting = await Voting.deploy(/* arguments du constructeur si besoin */);
  const deploymentTx = voting.deploymentTransaction();
  if (deploymentTx) {
    await deploymentTx.wait();
  } else {
    throw new Error("Deployment transaction is null.");
  }

  const receipt = await voting.deploymentTransaction()?.wait();
  console.log("Contrat déployé à :", receipt?.contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

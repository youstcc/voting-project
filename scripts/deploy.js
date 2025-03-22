const hre = require("hardhat");

async function main() {
  // 🚀 Déploiement du contrat Whitelist
  console.log("📢 Déploiement du contrat Whitelist...");
  const Whitelist = await hre.ethers.getContractFactory("Whitelist");
  const whitelist = await Whitelist.deploy();
  await whitelist.waitForDeployment();
  console.log("✅ Whitelist déployé à :", await whitelist.getAddress());

  // 🚀 Déploiement du contrat Voting avec l'adresse du Whitelist
  console.log("📢 Déploiement du contrat Voting...");
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(await whitelist.getAddress()); // On passe bien l'adresse ici
  await voting.waitForDeployment();
  console.log("✅ Voting déployé à :", await voting.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});



// Créez un fichier test/Voting.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let voting;
  let whitelist;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Déployer d'abord le contrat Whitelist
    const Whitelist = await ethers.getContractFactory("Whitelist");
    whitelist = await Whitelist.deploy();
    await whitelist.waitForDeployment();

    // Déployer ensuite le contrat Voting avec l'adresse du Whitelist
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(await whitelist.getAddress());
    await voting.waitForDeployment();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should set the right whitelist address", async function () {
      expect(await voting.whitelist()).to.equal(await whitelist.getAddress());
    });
  });

  describe("Workflow", function () {
    it("Should start in RegisteringVoters status", async function () {
      expect(await voting.status()).to.equal(0); // 0 = RegisteringVoters
    });

    it("Should allow owner to start proposals registration", async function () {
      await voting.startProposalsRegistration();
      expect(await voting.status()).to.equal(1); // 1 = ProposalsRegistrationStarted
    });
  });
});
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
    console.log("Voting deployed at:", await voting.getAddress());

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should set the right whitelist address", async function () {
      expect(await voting.whitelist()).to.equal(await whitelist.getAddress());
    });

    it("Should display the Voting contract address", async function () {
      console.log("Voting deployed at:", await voting.getAddress());
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

    it("Should tally votes correctly and update winningProposalId", async function () {
      // Register voters
      await whitelist.addAddressToWhitelist(addr1.address);
      await whitelist.addAddressToWhitelist(addr2.address);

      // Start proposal registration
      await voting.startProposalsRegistration();

      // Add proposals
      await voting.connect(addr1).submitProposal("Proposal A");
      await voting.connect(addr2).submitProposal("Proposal B");

      // End proposal registration
      await voting.endProposalsRegistration();

      // Start voting session
      await voting.startVotingSession();

      // Cast votes
      await voting.connect(addr1).vote(0); // Vote for Proposal A
      await voting.connect(addr2).vote(1); // Vote for Proposal B

      // End voting session
      await voting.endVoting();

      // Tally votes
      await voting.tallyVotes();

      // Check winningProposalId (can be either 0 or 1 since both have same votes)
      const winningProposalId = await voting.winningProposalId();
      expect([0, 1]).to.include(Number(winningProposalId)); // ✅
    });

    it("Should return all submitted proposals", async function () {
      await whitelist.addAddressToWhitelist(addr1.address);

      await voting.startProposalsRegistration();
      await voting.connect(addr1).submitProposal("Proposal A");
      await voting.connect(addr1).submitProposal("Proposal B");

      const allProposals = await voting.getAllProposals();

      expect(allProposals.length).to.equal(2);
      expect(allProposals[0].description).to.equal("Proposal A");
      expect(allProposals[1].description).to.equal("Proposal B");
    });

    it("Should allow owner to restart the voting session", async function () {
      await whitelist.addAddressToWhitelist(addr1.address);

      // Première session de propositions et de votes
      await voting.startProposalsRegistration();
      await voting.connect(addr1).submitProposal("Proposal A");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await voting.endVoting();
      await voting.tallyVotes();

      // Vérifie l'état après la première session
      expect(await voting.status()).to.equal(5); // VotesTallied

      // Redémarre une nouvelle session
      await voting.restartVotingSession();

      // Vérifie que l'état est revenu à RegisteringVoters (0)
      expect(await voting.status()).to.equal(0);

      // Vérifie que les propositions précédentes sont effacées
      const allProposals = await voting.getAllProposals();
      expect(allProposals.length).to.equal(0);
    });

    it("Should not allow non-owner to restart the voting session", async function () {
      await whitelist.addAddressToWhitelist(addr1.address);

      // End a voting session properly first
      await voting.startProposalsRegistration();
      await voting.connect(addr1).submitProposal("Proposal X");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await voting.endVoting();
      await voting.tallyVotes();

      // Attempt to restart the voting session as a non-owner
      await expect(voting.connect(addr1).restartVotingSession()).to.be.reverted;
    });
  });

  describe("Whitelist Contract", function () {
    it("Should allow the owner to add an address to the whitelist", async function () {
      await whitelist.addAddressToWhitelist(addr1.address);
      const isWhitelisted = await whitelist.isWhitelisted(addr1.address);
      expect(isWhitelisted).to.be.true;
    });

    it("Should not allow a non-owner to add to the whitelist", async function () {
      await expect(
        whitelist.connect(addr1).addAddressToWhitelist(addr2.address)
      ).to.be.reverted;
    });

    it("Should reflect isRegistered correctly in Voter struct", async function () {
      await whitelist.addAddressToWhitelist(addr1.address);
      await voting.registerVoter(addr1.address);
      const voter = await voting.voters(addr1.address);
      expect(voter.isRegistered).to.be.true;
    });
  });
});

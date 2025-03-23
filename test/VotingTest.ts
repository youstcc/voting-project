import { ethers } from "hardhat";
import { expect } from "chai";

describe("Voting contract tests", function () {
  let Voting: any;
  let voting: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2] = await ethers.getSigners();
    voting = await Voting.deploy();
    await voting.waitForDeployment();
  });

  // Test 1 : Vérifie qu'un électeur peut être enregistré correctement
  it("Should register a voter correctly", async function () {
    await voting.addVoter(addr1.address);
    const voter = await voting.voters(addr1.address);
    expect(voter.isRegistered).to.equal(true);
  });

  // Test 2 : Vérifie qu'une proposition peut être enregistrée si la session a commencé
  it("Should allow proposal registration if session has started", async function () {
    await voting.addVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.connect(addr1).registerProposal("Proposition 1");
    const proposals = await voting.getAllProposals();
    expect(proposals[0].description).to.equal("Proposition 1");
  });


  // Test 3 : Vérifie qu'un électeur peut voter correctement
  it("Should allow a voter to vote correctly", async function () {
    await voting.addVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.connect(addr1).registerProposal("Proposition 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    const voter = await voting.voters(addr1.address);
    expect(voter.hasVoted).to.equal(true);
    expect(voter.votedProposalId).to.equal(0);
  });

  // Test 4 : Vérifie que la réinitialisation du vote fonctionne correctement
  it("Should reset voting correctly", async function () {
    await voting.addVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.connect(addr1).registerProposal("Proposition 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    await voting.endVotingSession();
    await voting.tallyVotes();
    await voting.resetVoting();
    expect(await voting.currentStatus()).to.equal(0); // RegisteringVoters
    const proposals = await voting.getAllProposals();
    expect(proposals.length).to.equal(0);
  });
});
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

    constructor() Ownable(msg.sender) {}

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    WorkflowStatus public currentStatus;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    address[] public voterAddresses;
    uint public winningProposalId;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);

    modifier onlyRegistered() {
        require(voters[msg.sender].isRegistered, "Not registered");
        _;
    }

    function addVoter(address _addr) external onlyOwner {
        require(currentStatus == WorkflowStatus.RegisteringVoters, "Voter registration not open");
        require(!voters[_addr].isRegistered, "Already registered");

        voters[_addr].isRegistered = true;
        voterAddresses.push(_addr);
        emit VoterRegistered(_addr);
    }

    function getAllVoters() external view returns (address[] memory) {
        return voterAddresses;
    }

    function startProposalsRegistration() external onlyOwner {
        require(currentStatus == WorkflowStatus.RegisteringVoters, "Wrong status");
        emit WorkflowStatusChange(currentStatus, WorkflowStatus.ProposalsRegistrationStarted);
        currentStatus = WorkflowStatus.ProposalsRegistrationStarted;
    }

    function isProposalUnique(string memory _desc) internal view returns (bool) {
        for (uint i = 0; i < proposals.length; i++) {
            if (keccak256(bytes(proposals[i].description)) == keccak256(bytes(_desc))) {
                return false; // La proposition existe déjà
            }
        }
        return true; // La proposition est unique
    }

    // Modifier la fonction registerProposal pour vérifier les doublons
    function registerProposal(string calldata _desc) external onlyRegistered {
        require(currentStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration not open");
        require(isProposalUnique(_desc), "Proposal already exists"); // Vérifier l'unicité

        proposals.push(Proposal({description: _desc, voteCount: 0}));
        emit ProposalRegistered(proposals.length - 1);
    }

    function endProposalsRegistration() external onlyOwner {
    require(currentStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration not started or already ended");
    emit WorkflowStatusChange(currentStatus, WorkflowStatus.ProposalsRegistrationEnded);
    currentStatus = WorkflowStatus.ProposalsRegistrationEnded;
    }

    function getAllProposals() external view returns (Proposal[] memory) {
        return proposals;
    }

    function startVotingSession() external onlyOwner {
        require(currentStatus == WorkflowStatus.ProposalsRegistrationEnded, "Proposals ended");
        emit WorkflowStatusChange(currentStatus, WorkflowStatus.VotingSessionStarted);
        currentStatus = WorkflowStatus.VotingSessionStarted;
    }


    function vote(uint _proposalId) external onlyRegistered {
        require(currentStatus == WorkflowStatus.VotingSessionStarted, "Voting session not started");
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(_proposalId < proposals.length, "Invalid proposal id");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;

        emit Voted(msg.sender, _proposalId);
    }

    function endVotingSession() external onlyOwner {
        require(currentStatus == WorkflowStatus.VotingSessionStarted, "Voting session not started");
        emit WorkflowStatusChange(currentStatus, WorkflowStatus.VotingSessionEnded);
        currentStatus = WorkflowStatus.VotingSessionEnded;
    }

    function tallyVotes() external onlyOwner {
        require(currentStatus == WorkflowStatus.VotingSessionEnded, "Voting session not ended");

        uint winningVoteCount = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }

        emit WorkflowStatusChange(currentStatus, WorkflowStatus.VotesTallied);
        currentStatus = WorkflowStatus.VotesTallied;
    }

    function getWinner() external view returns (string memory) {
        require(currentStatus == WorkflowStatus.VotesTallied, "Votes not tallied yet");
        return proposals[winningProposalId].description;
    }

    function getProposalsCount() public view returns (uint) {
        return proposals.length;
    }


    function resetVoting() external onlyOwner {
        // Réinitialisation du statut
        currentStatus = WorkflowStatus.RegisteringVoters;

        // Réinitialisation des électeurs
        for (uint i = 0; i < voterAddresses.length; i++) {
            address voterAddr = voterAddresses[i];
            voters[voterAddr].isRegistered = false;
            voters[voterAddr].hasVoted = false;
            voters[voterAddr].votedProposalId = 0;
        }

        // Réinitialisation des propositions
        delete proposals;

        // Réinitialisation du gagnant
        winningProposalId = 0;

        // Supprimer tous les électeurs enregistrés
        delete voterAddresses;

        emit WorkflowStatusChange(WorkflowStatus.VotesTallied, WorkflowStatus.RegisteringVoters);
    }
}

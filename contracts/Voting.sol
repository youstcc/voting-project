// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Whitelist.sol";  // Import du contrat Whitelist

contract Voting is Ownable {
    Whitelist public whitelist;

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

    WorkflowStatus public status;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    uint public winningProposalId;
    uint public totalVoters;
    uint public totalVotes;

    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event VoterRegistered(address voterAddress);

    constructor(address _whitelistAddress) Ownable(msg.sender) {
        whitelist = Whitelist(_whitelistAddress);
    }

    function registerVoter(address _voter) external onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "Voter registration is not open");
        require(whitelist.isWhitelisted(_voter), "Address not in whitelist");
        require(!voters[_voter].hasVoted && voters[_voter].votedProposalId == 0, "Already registered");

        voters[_voter] = Voter({
            isRegistered: true,
            hasVoted: false,
            votedProposalId: 0
        });

        totalVoters++;

        emit VoterRegistered(_voter);
    }

    modifier onlyWhitelisted() {
        require(whitelist.isWhitelisted(msg.sender), unicode"Vous n'êtes pas dans la whitelist !");
        _;
    }

    function submitProposal(string memory _desc) external onlyWhitelisted {
        proposals.push(Proposal(_desc, 0));
        emit ProposalRegistered(proposals.length - 1);
    }

    function startProposalsRegistration() external onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "Wrong status");
        status = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    function endProposalsRegistration() external onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Wrong status");
        status = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    function startVotingSession() external onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationEnded, "Wrong status");
        status = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    function endVoting() external onlyOwner {
        require(status == WorkflowStatus.VotingSessionStarted, "Wrong status");
        status = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    function vote(uint _proposalId) external onlyWhitelisted {
        require(status == WorkflowStatus.VotingSessionStarted, "Voting session closed");
        require(!voters[msg.sender].hasVoted, "Already voted");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;

        totalVotes++;

        emit Voted(msg.sender, _proposalId);
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }

    function getWinner() external view returns (Proposal memory) {
        require(status == WorkflowStatus.VotesTallied, "Votes not tallied yet");
        return proposals[winningProposalId];
    }

    function tallyVotes() external onlyOwner {
        require(status == WorkflowStatus.VotingSessionEnded, "Wrong status");
        
        uint winningVoteCount = 0;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }

        status = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    function getAllProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    function getParticipationStats() external view returns (uint, uint, uint) {
        uint participationRate = totalVoters > 0 ? (totalVotes * 100) / totalVoters : 0;
        return (totalVoters, totalVotes, participationRate);
    }

    function restartVotingSession() external onlyOwner {
        require(status == WorkflowStatus.VotesTallied, "Can restart only after votes are tallied");
        
        // Reset proposals and voter states
        delete proposals;
        for (uint i = 0; i < totalVoters; i++) {
            voters[msg.sender].hasVoted = false;
            voters[msg.sender].votedProposalId = 0;
        }
        
        winningProposalId = 0;
        totalVotes = 0;

        // Restart workflow
        status = WorkflowStatus.RegisteringVoters;
        emit WorkflowStatusChange(WorkflowStatus.VotesTallied, WorkflowStatus.RegisteringVoters);
    }
}

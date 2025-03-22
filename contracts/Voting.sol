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

    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    constructor(address _whitelistAddress) Ownable(msg.sender) {
        whitelist = Whitelist(_whitelistAddress);
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



    function vote(uint _proposalId) external onlyWhitelisted {
        require(status == WorkflowStatus.VotingSessionStarted, "Voting session closed");
        require(!voters[msg.sender].hasVoted, "Already voted");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;

        emit Voted(msg.sender, _proposalId);
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }

    function getWinner() external view returns (Proposal memory) {
        require(status == WorkflowStatus.VotesTallied, "Votes not tallied yet");
        return proposals[winningProposalId];
    }
}




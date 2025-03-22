
export interface Proposal {
  id: number
  title: string
  description: string
  author: string
  votes: number
}

// Interface pour le contrat Whitelist.sol
export interface WhitelistContract {
  // Ajouter un électeur à la liste blanche
  addVoter: (address: string) => Promise<void>

  // Vérifier si une adresse est dans la liste blanche
  isVoter: (address: string) => Promise<boolean>

  // Obtenir la liste des électeurs
  getVoters: () => Promise<string[]>
}

// Interface pour le contrat Voting.sol
export interface VotingContract {
  // Démarrer la session d'enregistrement des propositions
  startProposalsRegistration: () => Promise<void>

  // Terminer la session d'enregistrement des propositions
  endProposalsRegistration: () => Promise<void>

  // Démarrer la session de vote
  startVotingSession: () => Promise<void>

  // Terminer la session de vote
  endVotingSession: () => Promise<void>

  // Ajouter une proposition
  addProposal: (title: string, description: string) => Promise<void>

  // Voter pour une proposition
  vote: (proposalId: number) => Promise<void>

  // Comptabiliser les votes
  tallyVotes: () => Promise<void>

  // Obtenir les propositions
  getProposals: () => Promise<Proposal[]>

  // Obtenir la proposition gagnante
  getWinningProposal: () => Promise<Proposal>

  // Obtenir l'état actuel du vote
  getVotingState: () => Promise<number>
}

// Fonction pour initialiser les contrats (à implémenter avec ethers.js ou web3.js)
// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}




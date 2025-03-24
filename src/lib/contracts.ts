import { ethers } from "ethers"
import WhitelistABI from "./abi/WhitelistABI.json"
import VotingABI from "./abi/VotingABI.json"

// Enum pour le statut du workflow
export enum WorkflowStatus {
  RegisteringVoters = 0,
  ProposalsRegistrationStarted = 1,
  ProposalsRegistrationEnded = 2,
  VotingSessionStarted = 3,
  VotingSessionEnded = 4,
  VotesTallied = 5,
}

export const startProposalsRegistration = async (votingContract: ethers.Contract): Promise<boolean> => {
  try {
    const tx = await votingContract.startProposalsRegistration()
    await tx.wait()
    return true
  } catch (error) {
    console.error("Erreur lors du démarrage de la session de propositions :", error)
    return false
  }
}

// Interface pour les propositions formatées
export interface FormattedProposal {
  id: number
  title: string
  description: string
  author: string
  votes: number
}

// Interface pour les propositions du contrat
export interface ContractProposal {
  description: string
  voteCount: bigint
}

// ✅ Fonction pour initialiser les contrats
export const initializeContracts = async (votingContractAddress: string, whitelistContractAddress: string) => {
  try {
    // Vérifier si MetaMask est installé
    if (typeof window === "undefined") return null

    const { ethereum } = window as { ethereum?: any }
    if (!ethereum) {
      console.error("MetaMask n'est pas installé")
      return null
    }

    console.log("🧪 Vérification des adresses :");
    console.log("Voting :", votingContractAddress, "=>", ethers.isAddress(votingContractAddress));
    console.log("Whitelist :", whitelistContractAddress, "=>", ethers.isAddress(whitelistContractAddress));

    // ✅ Vérifier que les adresses sont valides
    if (!ethers.isAddress(votingContractAddress) || !ethers.isAddress(whitelistContractAddress)) {
      throw new Error("Les adresses des contrats doivent être valides")
    }

    // Créer un provider et un signer
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()

    // Initialiser les contrats
    const votingContract = new ethers.Contract(votingContractAddress, VotingABI, signer)
    const whitelistContract = new ethers.Contract(whitelistContractAddress, WhitelistABI, signer)

    return { votingContract, whitelistContract, provider, signer }
  } catch (error) {
    console.error("Erreur lors de l'initialisation des contrats:", error)
    return null
  }
}

// Fonction pour convertir le statut du workflow en Phase
export const workflowStatusToPhase = (status: WorkflowStatus) => {
  switch (status) {
    case WorkflowStatus.RegisteringVoters:
      return "registration"
    case WorkflowStatus.ProposalsRegistrationStarted:
      return "proposal-submission"
    case WorkflowStatus.ProposalsRegistrationEnded:
      return "voting"
    case WorkflowStatus.VotingSessionStarted:
      return "voting"
    case WorkflowStatus.VotingSessionEnded:
      return "counting"
    case WorkflowStatus.VotesTallied:
      return "results"
    default:
      return "registration"
  }
}

// Fonction pour formater les propositions du contrat
export const formatProposals = (
  contractProposals: ContractProposal[],
  voterAddresses: string[] = [],
): FormattedProposal[] => {
  return contractProposals.map((proposal, index) => {
    // Extraire le titre (première ligne) et la description (reste du texte)
    const lines = proposal.description.split("\n")
    const title = lines[0] || "Sans titre"
    const description = lines.slice(1).join("\n") || title

    // Utiliser une adresse aléatoire de la liste des électeurs comme auteur fictif
    const randomIndex = Math.floor(Math.random() * Math.max(1, voterAddresses.length))
    const author =
      voterAddresses.length > 0 ? voterAddresses[randomIndex] : "0x0000000000000000000000000000000000000000"

    return {
      id: index,
      title,
      description,
      author,
      votes: Number(proposal.voteCount),
    }
  })
}

// Fonction pour vérifier si un utilisateur est enregistré
export const isUserWhitelisted = async (whitelistContract: ethers.Contract, address: string): Promise<boolean> => {
  try {
    return await whitelistContract.isWhitelisted(address)
  } catch (error) {
    console.error("Erreur lors de la vérification de l'enregistrement:", error)
    return false
  }
}

// Fonction pour vérifier si un utilisateur a déjà voté
export const hasUserVoted = async (votingContract: ethers.Contract, address: string): Promise<boolean> => {
  try {
    const voter = await votingContract.voters(address)
    return voter.hasVoted
  } catch (error) {
    console.error("Erreur lors de la vérification du vote:", error)
    return false
  }
}

// Fonction pour obtenir tous les électeurs enregistrés
export const getWhitelistedVoters = async (
  whitelistContract: ethers.Contract,
  provider: ethers.Provider,
): Promise<string[]> => {
  try {
    const filter = whitelistContract.filters.AddressAdded()
    const events = await whitelistContract.queryFilter(filter)

    const addresses = events.map((event) => {
      if ("args" in event) {
        const args = event.args as unknown as { _address: string }
        return args._address
      }
      return null
    })

    const validAddresses = await Promise.all(
      addresses.map(async (address) => {
        const isWhitelisted = await whitelistContract.isWhitelisted(address)
        return isWhitelisted ? address : null
      }),
    )

    return validAddresses.filter((address): address is string => address !== null)
  } catch (error) {
    console.error("Erreur lors de la récupération des électeurs:", error)
    return []
  }
}

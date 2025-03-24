"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { initializeContracts } from "./contracts"
import { VotingContract, WhitelistContract } from "./contract-interface"

// Interface pour le contexte d'intégration des contrats
interface ContractIntegrationContextType {
  isInitialized: boolean
  votingContractAddress: string
  whitelistContractAddress: string
  setContractAddresses: (votingAddress: string, whitelistAddress: string) => void
  initialize: () => Promise<boolean>
}

// Valeurs par défaut du contexte
const defaultContext: ContractIntegrationContextType = {
  isInitialized: false,
  votingContractAddress: "",
  whitelistContractAddress: "",
  setContractAddresses: () => {},
  initialize: async () => false,
}

// Création du contexte
const ContractIntegrationContext = createContext<ContractIntegrationContextType>(defaultContext)

// Hook personnalisé pour utiliser le contexte
export const useContractIntegration = () => useContext(ContractIntegrationContext)

// Fournisseur du contexte
export const ContractIntegrationProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [votingContractAddress, setVotingContractAddress] = useState("")
  const [whitelistContractAddress, setWhitelistContractAddress] = useState("")
  const [votingContract, setVotingContract] = useState<VotingContract | null>(null)
  const [whitelistContract, setWhitelistContract] = useState<WhitelistContract | null>(null)

  // Définir les adresses des contrats
  const setContractAddresses = (votingAddress: string, whitelistAddress: string) => {
    setVotingContractAddress(votingAddress)
    setWhitelistContractAddress(whitelistAddress)
    // Sauvegarder les adresses dans le localStorage pour les récupérer après un rechargement
    localStorage.setItem("votingContractAddress", votingAddress)
    localStorage.setItem("whitelistContractAddress", whitelistAddress)
  }

  // Initialiser les contrats
  const initialize = async (): Promise<boolean> => {
    if (!votingContractAddress || !whitelistContractAddress) {
      console.error("Les adresses des contrats ne sont pas définies")
      return false
    }

    try {
      const contracts = await initializeContracts(votingContractAddress, whitelistContractAddress)
      if (!contracts) {
        console.error("Échec de l'initialisation des contrats")
        return false
      }

      setVotingContract(contracts.votingContract as unknown as VotingContract)
      setWhitelistContract(contracts.whitelistContract as unknown as WhitelistContract)
      setIsInitialized(true)
      return true
    } catch (error) {
      console.error("Erreur lors de l'initialisation des contrats:", error)
      return false
    }
  }

  // Récupérer les adresses des contrats depuis le localStorage au chargement
  useEffect(() => {
    const savedVotingAddress = localStorage.getItem("votingContractAddress")
    const savedWhitelistAddress = localStorage.getItem("whitelistContractAddress")

    if (savedVotingAddress && savedWhitelistAddress) {
      setVotingContractAddress(savedVotingAddress)
      setWhitelistContractAddress(savedWhitelistAddress)
    }
  }, [])

  // Valeur du contexte
  const value = {
    isInitialized,
    votingContractAddress,
    whitelistContractAddress,
    setContractAddresses,
    initialize,
  }

  return <ContractIntegrationContext.Provider value={value}>{children}</ContractIntegrationContext.Provider>
}

// Composant pour configurer les contrats
export function ContractSetup() {
  const { isInitialized, votingContractAddress, whitelistContractAddress, setContractAddresses, initialize } =
    useContractIntegration()

  const [votingAddress, setVotingAddress] = useState(votingContractAddress)
  const [whitelistAddress, setWhitelistAddress] = useState(whitelistContractAddress)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mettre à jour les champs lorsque les adresses changent dans le contexte
  useEffect(() => {
    setVotingAddress(votingContractAddress)
    setWhitelistAddress(whitelistContractAddress)
  }, [votingContractAddress, whitelistContractAddress])

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Vérifier que les adresses sont valides
      if (!ethers.isAddress(votingAddress) || !ethers.isAddress(whitelistAddress)) {
        throw new Error("Les adresses des contrats ne sont pas valides")
      }

      // Définir les adresses des contrats
      setContractAddresses(votingAddress, whitelistAddress)

      // Initialiser les contrats
      const success = await initialize()
      if (!success) {
        throw new Error("Échec de l'initialisation des contrats")
      } else {
        setError(null) // Nettoyer l'erreur visuelle si l'initialisation réussit
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Configuration des Contrats</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="voting-address" className="text-sm font-medium">
            Adresse du contrat Voting
          </label>
          <input
            id="voting-address"
            type="text"
            value={votingAddress}
            onChange={(e) => setVotingAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="whitelist-address" className="text-sm font-medium">
            Adresse du contrat Whitelist
          </label>
          <input
            id="whitelist-address"
            type="text"
            value={whitelistAddress}
            onChange={(e) => setWhitelistAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        {!isInitialized && error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || isInitialized}
          className={`px-4 py-2 rounded-md ${
            isInitialized
              ? "bg-green-500 text-white"
              : isLoading
                ? "bg-gray-300 text-gray-500"
                : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isInitialized ? "Contrats Initialisés" : isLoading ? "Initialisation..." : "Initialiser les Contrats"}
        </button>
      </form>
    </div>
  )
}

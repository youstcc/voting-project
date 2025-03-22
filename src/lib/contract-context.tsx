"use client";

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
import { ethers } from "ethers";
import { getCurrentAccount, listenForAccountChanges } from "./metamask";
import { initializeContracts, workflowStatusToPhase, isUserWhitelisted, getWhitelistedVoters, hasUserVoted } from "./contracts";

// Définition des phases du vote
// Phases de l'application
export enum Phase {
  Registration = "registration",
  ProposalSubmission = "proposal-submission",
  Voting = "voting",
  Counting = "counting",
  Results = "results",
}

const defaultContext: ContractContextType = {
  currentAccount: null,
  isAdmin: false,
  isRegistered: false,
  hasVoted: false,
  currentPhase: Phase.Registration,
  voters: [],
  registerVoter: async () => {},
  adminAddress: "",
  votingContractAddress: "",
  whitelistContractAddress: "",
  isInitialized: false,
  isLoading: false,
  error: null,
  setAdminAddress: () => {},
  setContractAddresses: () => {},
  initialize: async () => false,
};


// Interface pour le contexte
interface ContractContextType {
  currentAccount: string | null;
  isAdmin: boolean;
  isRegistered: boolean;
  hasVoted: boolean;
  currentPhase: Phase;
  adminAddress: string;
  voters: string[]; // Add voters property
  votingContractAddress: string;
  whitelistContractAddress: string;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  setAdminAddress: (address: string) => void;
  setContractAddresses: (votingAddress: string, whitelistAddress: string) => void;
  initialize: () => Promise<boolean>;
  registerVoter: (address: string) => Promise<void>;
}

const ContractContext = createContext<ContractContextType>(defaultContext);

export const useContract = () => useContext(ContractContext)!;

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [adminAddress, setAdminAddress] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.Registration);
  const [votingContractAddress, setVotingContractAddress] = useState<string>("");
  const [whitelistContractAddress, setWhitelistContractAddress] = useState<string>("");
  const [whitelistContract, setWhitelistContract] = useState<ethers.Contract | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  

  // Vérifier si l'utilisateur est l'admin
  const isAdmin = currentAccount?.toLowerCase() === adminAddress.toLowerCase();

  // Définir les adresses des contrats
  const setContractAddresses = (votingAddress: string, whitelistAddress: string) => {
    setVotingContractAddress(votingAddress);
    setWhitelistContractAddress(whitelistAddress);
  };

  // Initialiser les contrats
  const initialize = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const contracts = await initializeContracts(votingContractAddress, whitelistContractAddress);
      if (!contracts) throw new Error("Échec de l'initialisation");
      setWhitelistContract(contracts.whitelistContract);
      setAdminAddress(await contracts.whitelistContract.owner());
      setIsInitialized(true);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur inconnue");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [votingContractAddress, whitelistContractAddress]);

  // Enregistrer un électeur
  const registerVoter = async (address: string) => {
    if (!whitelistContract || !isAdmin) return;
    try {
      setIsLoading(true);
      const tx = await whitelistContract.addAddressToWhitelist(address);
      await tx.wait();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer l'adresse MetaMask
  useEffect(() => {
    const fetchAccount = async () => {
      const account = await getCurrentAccount();
      setCurrentAccount(account);
    };
    fetchAccount();
    const unsubscribe = listenForAccountChanges((accounts) => {
      setCurrentAccount(accounts.length > 0 ? accounts[0] : null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ContractContext.Provider
      value={{
        currentAccount,
        isAdmin,
        isRegistered,
        hasVoted,
        currentPhase,
        adminAddress,
        voters: [], // Add voters property
        votingContractAddress,
        whitelistContractAddress,
        isInitialized,
        isLoading,
        error,
        setAdminAddress,
        setContractAddresses,
        initialize,
        registerVoter,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};




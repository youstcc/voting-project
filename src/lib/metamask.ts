// Fonction pour vérifier si MetaMask est installé
export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const { ethereum } = window as { ethereum?: any };
  return Boolean(ethereum && ethereum.isMetaMask);
};

// Fonction pour se connecter à MetaMask
export const connectMetaMask = async (): Promise<string[]> => {
  try {
    if (typeof window === 'undefined') throw new Error("Exécution côté serveur");
    
    const { ethereum } = window as { ethereum?: any };

    if (!ethereum) {
      throw new Error("MetaMask n'est pas installé");
    }

    // Demander la connexion au compte
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    return accounts;
  } catch (error) {
    console.error("Erreur lors de la connexion à MetaMask:", error);
    throw error;
  }
};



// Fonction pour obtenir le compte actuel
export const getCurrentAccount = async (): Promise<string | null> => {
  try {
    if (typeof window === "undefined") return null

    const { ethereum } = window as { ethereum?: any }

    if (!ethereum) {
      return null
    }

    const accounts = await ethereum.request({ method: "eth_accounts" })

    if (accounts.length === 0) {
      return null
    }

    return accounts[0]
  } catch (error) {
    console.error("Erreur lors de la récupération du compte:", error)
    return null
  }
}

// Fonction pour écouter les changements de compte
export const listenForAccountChanges = (callback: (accounts: string[]) => void): (() => void) => {
  if (typeof window === "undefined") return () => {}

  const { ethereum } = window as { ethereum?: any }

  if (ethereum) {
    ethereum.on("accountsChanged", callback)
    return () => {
      ethereum.removeListener("accountsChanged", callback)
    }
  }

  return () => {}
}

// Fonction pour écouter les changements de réseau
export const listenForNetworkChanges = (callback: (chainId: string) => void): (() => void) => {
  if (typeof window === "undefined") return () => {}

  const { ethereum } = window as { ethereum?: any }

  if (ethereum) {
    ethereum.on("chainChanged", callback)
    return () => {
      ethereum.removeListener("chainChanged", callback)
    }
  }

  return () => {}
}

// Fonction pour changer de compte
export const switchAccount = async (): Promise<void> => {
  try {
    if (typeof window === "undefined") return

    const { ethereum } = window as { ethereum?: any }
    if (ethereum) {
      await ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      })
    }
  } catch (error) {
    console.error("Erreur lors du changement de compte:", error)
    throw error
  }
}


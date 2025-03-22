"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserRound, Users, RefreshCw } from "lucide-react"
import { connectMetaMask, getCurrentAccount, listenForAccountChanges, switchAccount } from "@/lib/metamask"
import { useContract } from "@/lib/contract-context"

export function AccountSwitcher() {
  const { currentAccount, isAdmin, isRegistered, adminAddress, registerVoter } = useContract()
  const [accounts, setAccounts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Récupérer les comptes disponibles
  const fetchAccounts = async () => {
    setIsRefreshing(true)
    try {
      const fetchedAccounts = await connectMetaMask()
      setAccounts(fetchedAccounts)
    } catch (error) {
      console.error("Erreur lors de la récupération des comptes:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Écouter les changements de compte
  useEffect(() => {
    const unsubscribe = listenForAccountChanges((newAccounts) => {
      setAccounts(newAccounts)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Charger les comptes au chargement du composant
  useEffect(() => {
    const loadAccounts = async () => {
      const account = await getCurrentAccount()
      if (account) {
        fetchAccounts()
      }
    }
    loadAccounts()
  }, [])

  // Changer de compte - Ouvre la boîte de dialogue MetaMask
  const handleSwitchAccount = async () => {
    setIsLoading(true)
    try {
      await switchAccount()
      const account = await getCurrentAccount()
      if (account) {
        await fetchAccounts()
      }
    } catch (error) {
      console.error("Erreur lors du changement de compte:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // S'inscrire sur la whitelist
  const handleRegister = async () => {
    if (currentAccount && !isRegistered) {
      await registerVoter(currentAccount)
    }
  }

  // Formater l'adresse pour l'affichage
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="flex items-center gap-2">
      {currentAccount && (
        <>
          {isAdmin ? (
            <Badge variant="default" className="mr-2">
              Admin
            </Badge>
          ) : isRegistered ? (
            <Badge variant="secondary" className="mr-2">
              Électeur
            </Badge>
          ) : (
            <Badge variant="outline" className="mr-2 cursor-pointer hover:bg-secondary" onClick={handleRegister}>
              S&apos;inscrire
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="font-mono">
                <UserRound className="h-4 w-4 mr-2" />
                {formatAddress(currentAccount)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Comptes</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {accounts.map((account) => (
                <DropdownMenuItem
                  key={account}
                  className={`font-mono ${account === currentAccount ? "bg-secondary" : ""}`}
                >
                  {account === adminAddress && <Users className="h-4 w-4 mr-2 text-primary" />}
                  {formatAddress(account)}
                  {account === currentAccount && " (actuel)"}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={fetchAccounts} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser les comptes
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={handleSwitchAccount} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Changer"}
          </Button>
        </>
      )}

      {!currentAccount && (
        <Button onClick={connectMetaMask} disabled={isLoading} size="sm">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connexion...
            </>
          ) : (
            "Connecter MetaMask"
          )}
        </Button>
      )}
    </div>
  )
}


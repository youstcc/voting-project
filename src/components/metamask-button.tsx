"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { connectMetaMask, isMetaMaskInstalled, getCurrentAccount } from "@/lib/metamask"
import { Loader2 } from "lucide-react"

interface MetaMaskButtonProps {
  onConnect: (address: string) => void
  disabled?: boolean
}

export function MetaMaskButton({ onConnect, disabled = false }: MetaMaskButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Vérifier si MetaMask est installé
    setIsInstalled(isMetaMaskInstalled())

    // Vérifier si l'utilisateur est déjà connecté
    const checkConnection = async () => {
      const account = await getCurrentAccount()
      if (account) {
        onConnect(account)
      }
    }

    checkConnection()
  }, [onConnect])

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const accounts = await connectMetaMask()
      if (accounts.length > 0) {
        onConnect(accounts[0])
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la connexion à MetaMask"
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  if (!isInstalled) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open("https://metamask.io/download/", "_blank")}
        >
          Installer MetaMask
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          MetaMask est nécessaire pour s&apos;enregistrer et participer au vote
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleConnect} disabled={isConnecting || disabled} className="w-full">
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          "Se connecter avec MetaMask"
        )}
      </Button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  )
}


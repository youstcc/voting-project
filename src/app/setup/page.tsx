"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContractSetup } from "@/lib/contract-integration"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const router = useRouter()
  const [isComplete, setIsComplete] = useState(false)

  const handleComplete = () => {
    setIsComplete(true)
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configuration des Contrats</CardTitle>
          <CardDescription>
            Configurez les adresses des contrats Voting et Whitelist pour commencer à utiliser l&apos;application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ContractSetup />

          {isComplete && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
              Configuration terminée ! Redirection vers la page d&apos;accueil...
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleComplete}>Continuer vers l&apos;application</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}


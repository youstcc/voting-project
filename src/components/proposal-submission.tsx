"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Lock, Plus } from "lucide-react"
import { useContract, Phase } from "@/lib/contract-context"

export function ProposalSubmission() {
  const { isRegistered, currentPhase, proposals, addProposal } = useContract()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmitProposal = async () => {
    if (title && description) {
      await addProposal(title, description)
      setTitle("")
      setDescription("")
    }
  }

  const isProposalPhase = currentPhase === Phase.ProposalSubmission

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soumission des Propositions</CardTitle>
        <CardDescription>
          Les électeurs enregistrés peuvent soumettre leurs propositions pendant cette phase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isProposalPhase ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {currentPhase === Phase.Registration
                ? "Phase de propositions pas encore commencée"
                : "Phase de propositions terminée"}
            </AlertTitle>
            <AlertDescription>
              {currentPhase === Phase.Registration
                ? "La phase de soumission des propositions commencera après la phase d'enregistrement."
                : "Il n'est plus possible de soumettre des propositions."}
            </AlertDescription>
          </Alert>
        ) : !isRegistered ? (
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>Accès non autorisé</AlertTitle>
            <AlertDescription>Seuls les électeurs enregistrés peuvent soumettre des propositions.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="proposal-title">Titre de la proposition</Label>
              <Input
                id="proposal-title"
                placeholder="Entrez un titre concis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proposal-description">Description</Label>
              <Textarea
                id="proposal-description"
                placeholder="Décrivez votre proposition en détail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={handleSubmitProposal} disabled={!title || !description} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Soumettre la proposition
            </Button>
          </div>
        )}

        <div className="pt-4">
          <h3 className="text-lg font-medium mb-2">Propositions soumises ({proposals.length})</h3>
          <ScrollArea className="h-[300px] w-full">
            <div className="space-y-4 p-1">
              {proposals.length === 0 ? (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Aucune proposition soumise
                </div>
              ) : (
                proposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{proposal.title}</CardTitle>
                      <CardDescription className="text-xs">
                        Proposé par: {proposal.author.substring(0, 6)}...
                        {proposal.author.substring(proposal.author.length - 4)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm">{proposal.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}


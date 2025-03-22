"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, UserPlus } from "lucide-react"
import { useContract, Phase } from "@/lib/contract-context"

export function AdminPanel() {
  const {
    adminAddress,
    currentPhase,
    voters,
    registerVoter,
    startProposalsRegistration,
    endProposalsRegistration,
    endVotingSession,
    tallyVotes,
    resetVoting,
  } = useContract()

  const [voterAddress, setVoterAddress] = useState("")

  const addVoter = async () => {
    if (voterAddress && !voters.includes(voterAddress)) {
      await registerVoter(voterAddress)
      setVoterAddress("")
    }
  }

  const getPhaseActionButton = () => {
    switch (currentPhase) {
      case Phase.Registration:
        return <Button onClick={startProposalsRegistration}>Démarrer la session de propositions</Button>
      case Phase.ProposalSubmission:
        return <Button onClick={endProposalsRegistration}>Terminer la session de propositions</Button>
      case Phase.Voting:
        return <Button onClick={endVotingSession}>Terminer la session de vote</Button>
      case Phase.Counting:
        return <Button onClick={tallyVotes}>Comptabiliser les votes</Button>
      case Phase.Results:
        return (
          <Button variant="outline" onClick={resetVoting}>
            Réinitialiser le processus
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Panneau d&apos;Administration</CardTitle>
        <CardDescription>Gérez le processus de vote et les électeurs autorisés</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-3 rounded-md text-sm">
          <span className="font-medium">Adresse admin:</span> <span className="font-mono">{adminAddress}</span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Gestion des phases</h3>
            <p className="text-sm text-muted-foreground">Phase actuelle: {currentPhase}</p>
          </div>

          {getPhaseActionButton()}
        </div>

        {currentPhase === Phase.Registration && (
          <div className="space-y-4 pt-4">
            <Separator />
            <h3 className="text-lg font-medium">Liste blanche des électeurs</h3>

            <div className="flex gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="voter-address">Adresse de l&apos;électeur</Label>
                <Input
                  id="voter-address"
                  placeholder="0x..."
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                />
              </div>
              <Button className="self-end" onClick={addVoter}>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Électeurs enregistrés ({voters.length})</h4>
              <ScrollArea className="h-[200px] w-full rounded-md border">
                <div className="p-4">
                  {voters.length === 0 ? (
                    <div className="flex items-center justify-center h-[160px] text-muted-foreground">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Aucun électeur enregistré
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {voters.map((voter, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm font-mono">{voter}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


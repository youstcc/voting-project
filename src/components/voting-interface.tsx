"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Lock, ThumbsUp } from "lucide-react"
import { useContract, Phase } from "@/lib/contract-context"

export function VotingInterface() {
  const { isRegistered, currentPhase, proposals, vote } = useContract()

  // État local pour suivre les votes de l'utilisateur actuel
  const [votedProposals, setVotedProposals] = useState<number[]>([])

  const handleVote = async (proposalId: number) => {
    await vote(proposalId)
    setVotedProposals([...votedProposals, proposalId])
  }

  const isVotingPhase = currentPhase === Phase.Voting
  const canVote = isRegistered && isVotingPhase
  const hasVoted = (proposalId: number) => votedProposals.includes(proposalId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session de Vote</CardTitle>
        <CardDescription>Votez pour les propositions que vous souhaitez voir mises en œuvre</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isVotingPhase ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {currentPhase === Phase.Registration || currentPhase === Phase.ProposalSubmission
                ? "Phase de vote pas encore commencée"
                : "Phase de vote terminée"}
            </AlertTitle>
            <AlertDescription>
              {currentPhase === Phase.Registration || currentPhase === Phase.ProposalSubmission
                ? "La phase de vote commencera après la phase de soumission des propositions."
                : "Il n&apos;est plus possible de voter."}
            </AlertDescription>
          </Alert>
        ) : !isRegistered ? (
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>Accès non autorisé</AlertTitle>
            <AlertDescription>Seuls les électeurs enregistrés peuvent participer au vote.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Vote ouvert</AlertTitle>
              <AlertDescription>
                Vous pouvez voter pour une proposition. Votre vote est définitif et ne peut être modifié.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4 p-1">
            {proposals.length === 0 ? (
              <div className="flex items-center justify-center h-[360px] text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-2" />
                Aucune proposition disponible
              </div>
            ) : (
              proposals.map((proposal) => (
                <Card key={proposal.id} className={hasVoted(proposal.id) ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{proposal.title}</CardTitle>
                      <Badge variant="outline">
                        {proposal.votes} vote{proposal.votes !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Proposé par: {proposal.author.substring(0, 6)}...
                      {proposal.author.substring(proposal.author.length - 4)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm">{proposal.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      variant={hasVoted(proposal.id) ? "default" : "outline"}
                      className="w-full"
                      disabled={!canVote || hasVoted(proposal.id)}
                      onClick={() => handleVote(proposal.id)}
                    >
                      {hasVoted(proposal.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Voté
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Voter
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}


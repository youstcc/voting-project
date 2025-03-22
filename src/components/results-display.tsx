"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Trophy } from "lucide-react"
import { useContract, Phase } from "@/lib/contract-context"

export function ResultsDisplay() {
  const { currentPhase, proposals } = useContract()

  // Trier les propositions par nombre de votes (décroissant)
  const sortedProposals = [...proposals].sort((a, b) => b.votes - a.votes)

  // Ajouter le rang à chaque proposition
  const rankedProposals = sortedProposals.map((proposal, index) => ({
    ...proposal,
    rank: index + 1,
  }))

  const isResultsPhase = currentPhase === Phase.Results

  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats du Vote</CardTitle>
        <CardDescription>Consultez les résultats finaux du processus de vote</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isResultsPhase ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Résultats pas encore disponibles</AlertTitle>
            <AlertDescription>
              Les résultats seront disponibles une fois que l&apos;administrateur aura terminé le comptage des votes.
            </AlertDescription>
          </Alert>
        ) : rankedProposals.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aucune proposition</AlertTitle>
            <AlertDescription>
              Aucune proposition n&apos;a été soumise pendant la phase de propositions.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-medium">Proposition gagnante</h3>
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{rankedProposals[0].title}</CardTitle>
                    <Badge className="bg-yellow-500">{rankedProposals[0].votes} votes</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Proposé par: {rankedProposals[0].author.substring(0, 6)}...
                    {rankedProposals[0].author.substring(rankedProposals[0].author.length - 4)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm">{rankedProposals[0].description}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Classement complet</h3>
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-4">
                  {rankedProposals.map((result) => (
                    <Card key={result.id} className={result.rank === 1 ? "border-yellow-500" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {result.rank}
                            </Badge>
                            <CardTitle className="text-base">{result.title}</CardTitle>
                          </div>
                          <Badge variant={result.rank === 1 ? "default" : "outline"}>
                            {result.votes} vote{result.votes !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs ml-10">
                          Proposé par: {result.author.substring(0, 6)}...
                          {result.author.substring(result.author.length - 4)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm ml-10">{result.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}


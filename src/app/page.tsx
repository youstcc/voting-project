"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPanel } from "@/components/admin-panel";
import { VoterRegistration } from "@/components/voter-registration";
import { ProposalSubmission } from "@/components/proposal-submission";
import { VotingInterface } from "@/components/voting-interface";
import { ResultsDisplay } from "@/components/results-display";
import { AccountSwitcher } from "@/components/account-switcher";
import { useContract, Phase } from "@/lib/contract-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function Home() {
  const {
    currentAccount,
    isAdmin,
    currentPhase,
    adminAddress,
    setContractAddresses,
    votingContractAddress,
    whitelistContractAddress,
    isInitialized,
    isLoading,
    error,
    initialize,
  } = useContract();

  const [activeTab, setActiveTab] = useState("overview");
  const [tempVotingAddress, setTempVotingAddress] = useState(votingContractAddress || "");
  const [tempWhitelistAddress, setTempWhitelistAddress] = useState(whitelistContractAddress || "");
  const [setupMode, setSetupMode] = useState(!isInitialized);

  // Mettre à jour les adresses des contrats temporaires
  useEffect(() => {
    setTempVotingAddress(votingContractAddress || "");
    setTempWhitelistAddress(whitelistContractAddress || "");
  }, [votingContractAddress, whitelistContractAddress]);

  // Initialiser les contrats
  const handleInitializeContracts = async () => {
    if (tempVotingAddress && tempWhitelistAddress) {
      setContractAddresses(tempVotingAddress, tempWhitelistAddress);
      const success = await initialize();
      if (success) {
        setSetupMode(false);
      }
    } else {
      alert("Veuillez entrer les adresses des contrats");
    }
  };

  // Mettre à jour l'onglet actif en fonction du statut de l'utilisateur
  useEffect(() => {
    if (currentAccount) {
      setActiveTab(isAdmin ? "overview" : "registration");
    }
  }, [currentAccount, isAdmin]);

  if (setupMode) {
    return (
      <main className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Plateforme de Vote</h1>
          <AccountSwitcher />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration des Contrats</CardTitle>
            <CardDescription>Entrez les adresses des contrats Voting et Whitelist pour commencer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="voting-address">Adresse du contrat Voting</Label>
                <Input
                  id="voting-address"
                  placeholder="0x..."
                  value={tempVotingAddress}
                  onChange={(e) => setTempVotingAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="whitelist-address">Adresse du contrat Whitelist</Label>
                <Input
                  id="whitelist-address"
                  placeholder="0x..."
                  value={tempWhitelistAddress}
                  onChange={(e) => setTempWhitelistAddress(e.target.value)}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleInitializeContracts}
                disabled={isLoading || !tempVotingAddress || !tempWhitelistAddress}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initialisation...
                  </>
                ) : (
                  "Initialiser les contrats"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Plateforme de Vote</h1>
        <AccountSwitcher />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Chargement en cours...</p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>État Actuel du Processus</CardTitle>
          <CardDescription>
            Phase actuelle: <Badge variant="secondary">{currentPhase}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-5 gap-2 w-full">
              {Object.values(Phase).map((phase) => (
                <div
                  key={phase}
                  className={`p-2 text-center text-sm rounded-md ${
                    currentPhase === phase ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {phase}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="registration">Enregistrement</TabsTrigger>
          <TabsTrigger value="proposals">Propositions</TabsTrigger>
          <TabsTrigger value="voting">Vote</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue sur la Plateforme de Vote</CardTitle>
              <CardDescription>
                Cette application permet de gérer un processus de vote complet et sécurisé.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Le processus de vote se déroule en plusieurs phases :</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Enregistrement des électeurs sur liste blanche</li>
                <li>Soumission des propositions par les électeurs enregistrés</li>
                <li>Session de vote pour les propositions</li>
                <li>Comptabilisation des votes</li>
                <li>Publication des résultats</li>
              </ol>
            </CardContent>
          </Card>
          {isAdmin && <AdminPanel />}
        </TabsContent>

        <TabsContent value="registration">
          <VoterRegistration />
        </TabsContent>

        <TabsContent value="proposals">
          <ProposalSubmission />
        </TabsContent>

        <TabsContent value="voting">
          <VotingInterface />
        </TabsContent>

        <TabsContent value="results">
          <ResultsDisplay />
        </TabsContent>
      </Tabs>
    </main>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Lock } from "lucide-react";
import { MetaMaskButton } from "@/components/metamask-button";
import { useContract, Phase } from "@/lib/contract-context";

export function VoterRegistration() {
  const { currentAccount, isAdmin, isRegistered, currentPhase, registerVoter } = useContract();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleRegistration = async () => {
    console.log("✅ Bouton cliqué !");
    
    if (!currentAccount) {
      console.log("❌ Aucun compte détecté !");
      return;
    }

    console.log("📢 Adresse utilisée :", currentAccount);

    try {
      await registerVoter(currentAccount);
      console.log("✅ Inscription réussie !");
    } catch (error) {
      console.error("❌ Erreur d'enregistrement :", error);
    }
  };

  const handleMetaMaskConnect = () => {
    setIsConnecting(false);
  };

  const isRegistrationPhase = currentPhase === Phase.Registration;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enregistrement des Électeurs</CardTitle>
        <CardDescription>Seuls les électeurs enregistrés pourront soumettre des propositions et voter</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRegistrationPhase ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Phase d&apos;enregistrement terminée</AlertTitle>
            <AlertDescription>
              La phase d&apos;enregistrement des électeurs est terminée. Il n&apos;est plus possible de s&apos;enregistrer.
            </AlertDescription>
          </Alert>
        ) : isRegistered ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Vous êtes enregistré</AlertTitle>
            <AlertDescription>
              Votre adresse a été ajoutée à la liste blanche des électeurs. Vous pourrez participer aux phases suivantes.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {currentAccount ? (
              <>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Portefeuille connecté</AlertTitle>
                  <AlertDescription>
                    Votre portefeuille MetaMask est connecté. Vous pouvez maintenant vous enregistrer pour voter.
                  </AlertDescription>
                </Alert>
                <div className="grid gap-2">
                  <Label htmlFor="wallet-address">Votre adresse de portefeuille</Label>
                  <Input id="wallet-address" value={currentAccount || ""} readOnly className="font-mono text-sm" />

                </div>
                <Button onClick={handleRegistration} disabled={!currentAccount || !isRegistrationPhase} className="w-full">
                  S&apos;enregistrer comme électeur
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Connexion requise</AlertTitle>
                  <AlertDescription>
                    Connectez-vous avec MetaMask pour vous enregistrer comme électeur.
                  </AlertDescription>
                </Alert>
                <MetaMaskButton onConnect={handleMetaMaskConnect} disabled={!isRegistrationPhase || isConnecting} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}




# 🗳️ DApp Voting - Application de Vote Décentralisée

Ce projet est une application de vote basée sur un **smart contract Ethereum**. Elle permet à un administrateur de gérer un processus de vote en plusieurs phases, avec une interface simple sans embellissements.

## 📂 Structure du projet

voting-dapp/
├── artifacts/                  # Fichiers compilés des contrats
├── cache/                     # Cache Hardhat
├── contracts/                 # Smart Contracts
│   ├── SimpleStorage.sol
│   ├── Voting.sol             # Contrat principal utilisé
│   └── Whitelist.sol          # Ancien contrat (plus utilisé)
├── frontend/                  # Partie Frontend (React/Next.js)
│   ├── node_modules/
│   ├── public/
│   └── src/                   # Ton code source frontend (page.js, etc.)
├── ignition/                  # Modules de déploiement Hardhat
├── node_modules/
├── scripts/                   # Scripts de déploiement JS
│   ├── deployVoting.js
│   └── deployWhitelist.js     # Peut être supprimé si inutilisé
├── test/                      # Tests (facultatif)
├── typechain-types/           # Types générés (si TypeChain utilisé)
├── .env                       # Variables d’environnement
├── .gitignore
├── hardhat.config.ts          # Config Hardhat (TypeScript)
├── tsconfig.json              # Config TypeScript
├── package.json               # Dépendances racine (Hardhat)
├── package-lock.json
└── README.md                  # Documentation du projet



---

## 📄 Répartition du travail 

lien vers le fichier de répartition du travail : @notion à ajouter par Walid

---


## 🧪 Tests

Des tests ont été réalisés manuellement sur le smart contract à l’aide de **Hardhat** et de l’interface **frontend**.  
Les tests ont permis de vérifier :

- le comportement correct des **phases du workflow** (enregistrement, propositions, votes, résultats)
- la **restriction des droits** selon le rôle (admin / électeur)
- la **validité du décompte** des votes
- les cas limites (double vote, propositions hors phase, etc.)

✅ Le contrat fonctionne comme attendu.

---

## ⚙️ Technologies utilisées

- [Solidity](https://soliditylang.org/) — Langage de programmation pour les smart contracts
- [Hardhat](https://hardhat.org/) — Outil de développement Ethereum
- [Ethers.js](https://docs.ethers.org/) — Interaction avec Ethereum depuis le frontend
- [Next.js](https://nextjs.org/) — Framework React pour le frontend
- [MetaMask](https://metamask.io/) — Extension pour se connecter au wallet

---

## 🚀 Fonctionnalités

### ✅ Pour l’administrateur :

- Ajouter des adresses à la whitelist
- Démarrer la phase de soumission des propositions
- Arrêter la phase de soumission
- Démarrer la phase de vote
- Arrêter la phase de vote
- Comptabiliser les votes
- Afficher la proposition gagnante

### 🧑‍💼 Pour les électeurs whitelistés :

- Soumettre une proposition (pendant la bonne phase)
- Voter pour une proposition (pendant la phase de vote)
- Consulter les propositions
- Voir la proposition gagnante après les votes

---

## 🛠️ Installation et utilisation

### 1. Cloner le dépôt

```bash
git clone <lien-du-repo>
cd voting-project
```

### 2. Installer les dépendances

```bash	

npm install

cd frontend
npm install

cd ..
npx hardhat node
```

### 3. Lancer le réseau local avec Hardhat

```bash 
npx hardhat node
```

### 4.  Déployer le smart contract

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Copiez ensuite l’adresse du contrat dans :

```bash
/frontend/constants/index.js
```

### 5. Lancer le frontend

```bash
cd frontend
npm run dev
```

Ouvrez votre navigateur à l’adresse suivante : http://localhost:3000    

---

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📄 Contact

Disocrd : iceyouri
Mail : steckoyouri@gmail.com

---

## 📌 Remarques

- Toute la logique est centralisée dans Voting.sol : whitelist, phases, votes.
- Pour interagir avec le contrat, connectez MetaMask à votre réseau local (localhost:8545).
- Le premier compte Hardhat est l'admin par défaut
- Par manque de temps, nous n'avons pas testé le déploiement sur un réseau de production ni réalisé la vidéo de démo.

---


### 🙌 Auteurs

- Youri STECKO
- Walid SAKOUKNI








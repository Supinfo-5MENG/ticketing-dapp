# Ticketing DApp - Documentation technique

## Membres du groupe
- Clément Honore
- Ewen Bosquet

## Table des matieres

1. [Presentation du projet](#presentation-du-projet)
2. [Architecture](#architecture)
3. [Prerequis](#prerequis)
4. [Installation et lancement](#installation-et-lancement)
5. [Smart contract - Backend](#smart-contract---backend)
6. [Frontend](#frontend)
7. [Integration blockchain](#integration-blockchain)
8. [Fonctionnalites](#fonctionnalites)
9. [Structure des fichiers](#structure-des-fichiers)
10. [Configuration](#configuration)
11. [Deploiement](#deploiement)

---

## Presentation du projet

Ticketing DApp est une application de billetterie decentralisee construite sur la blockchain Ethereum. Elle permet de creer des evenements, distribuer des tickets sous forme de NFTs (ERC-721), valider les entrees et gerer la revente de tickets, le tout de maniere transparente et immuable.

Chaque ticket est un token ERC-721 unique enregistre sur la blockchain. Le systeme garantit qu'un utilisateur ne peut detenir qu'un seul ticket par evenement et que seuls les tickets de type STANDARD peuvent etre revendus.

---

## Architecture

Le projet suit une architecture monorepo composee de deux modules :

```
ticketing-dapp/
  ticketing-backend/    Smart contract Solidity + environnement Hardhat
  ticketing-frontend/   Application web Next.js
```

**Backend** : Smart contract Solidity compile et deploye via Hardhat. Le contrat herite de ERC721URIStorage (OpenZeppelin) et gere l'ensemble de la logique metier : creation d'evenements, emission de tickets, validation, revente et annulation.

**Frontend** : Application Next.js 16 avec React 19, communiquant avec le smart contract via la librairie Wagmi et le client Viem. L'interface utilise Tailwind CSS 4, Three.js pour les elements 3D et Framer Motion pour les animations.

**Communication** : Le frontend interagit directement avec le smart contract deploye sur la blockchain via des appels RPC. Aucun serveur intermediaire n'est necessaire. La connexion au wallet se fait via ConnectKit.

---

## Prerequis

- Node.js >= 18.x
- npm >= 9.x
- Un wallet Ethereum (MetaMask ou equivalent)
- Git

---

## Installation et lancement

### 1. Cloner le depot

```bash
git clone <url-du-depot>
cd ticketing-dapp
```

### 2. Installer et lancer le backend (blockchain locale)

```bash
cd ticketing-backend
npm install
```

Lancer un noeud Hardhat local :

```bash
npx hardhat node
```

Ce noeud expose un serveur JSON-RPC sur `http://127.0.0.1:8545` avec des comptes pre-finances pour les tests.

Dans un second terminal, deployer le contrat :

```bash
cd ticketing-backend
npx hardhat run scripts/deployTicketing.ts --network localhost
```

Le script affiche l'adresse du contrat deploye. Cette adresse doit etre reportee dans la configuration du frontend (voir section Configuration).

### 3. Installer et lancer le frontend

```bash
cd ticketing-frontend
npm install # ou npm install -f si l'installation échoue
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

### 4. Configurer le wallet

Ajouter le reseau Hardhat local dans MetaMask :

| Parametre       | Valeur                    |
|-----------------|---------------------------|
| Nom du reseau   | Hardhat                   |
| URL RPC         | http://127.0.0.1:8545     |
| Chain ID        | 31337                     |
| Symbole         | ETH                       |

Importer un des comptes de test fournis par `npx hardhat node` en utilisant sa cle privee.

---

## Smart contract - Backend

### Contrat : Ticketing.sol

**Chemin** : `ticketing-backend/contracts/Ticketing.sol`

**Compilateur** : Solidity 0.8.28

**Heritage** : ERC721URIStorage (OpenZeppelin 5.4.0)

**Token** : nom "EventTicket", symbole "ETKT"

### Structures de donnees

#### Event

| Champ       | Type    | Description                          |
|-------------|---------|--------------------------------------|
| id          | uint256 | Identifiant unique de l'evenement    |
| endDate     | uint256 | Timestamp de fin (Unix)              |
| organizer   | address | Adresse du createur de l'evenement   |
| exists      | bool    | Indique si l'evenement existe        |
| cancelled   | bool    | Indique si l'evenement est annule    |
| name        | string  | Nom de l'evenement                   |
| metadataURI | string  | URI vers les metadonnees             |

#### Ticket

| Champ      | Type       | Description                          |
|------------|------------|--------------------------------------|
| id         | uint256    | Identifiant unique du ticket (= tokenId) |
| eventId    | uint256    | Identifiant de l'evenement associe   |
| used       | bool       | Indique si le ticket a ete scanne    |
| ticketType | TicketType | Type du ticket                       |

#### TicketType (enum)

| Valeur     | Index | Description                                          |
|------------|-------|------------------------------------------------------|
| STANDARD   | 0     | Ticket classique, achetable par tous, revendable     |
| VIP        | 1     | Cree par l'organisateur pour un destinataire precis   |
| STAFF      | 2     | Cree par l'organisateur, permet de scanner des tickets |
| ORGANIZER  | 3     | Cree automatiquement pour le createur de l'evenement  |

### Fonctions publiques

#### Gestion des evenements

| Fonction                | Parametres                              | Acces         | Description                                         |
|-------------------------|-----------------------------------------|---------------|-----------------------------------------------------|
| `createEvent`           | name, endDate, metadataURI              | Tous          | Cree un evenement et un ticket ORGANIZER automatique |
| `updateEventMetadata`   | eventId, newMetadataURI                 | Organisateur  | Met a jour l'URI des metadonnees                     |
| `cancelEvent`           | eventId                                 | Organisateur  | Annule l'evenement                                   |

#### Gestion des tickets

| Fonction              | Parametres                              | Acces         | Description                                                    |
|-----------------------|-----------------------------------------|---------------|----------------------------------------------------------------|
| `createTicket`        | eventId, ticketType, ticketURI          | Tous*         | Cree un ticket. STANDARD pour tous, VIP/STAFF pour organisateur |
| `createTicketFor`     | eventId, to, ticketType, ticketURI      | Organisateur  | Cree un ticket VIP ou STAFF pour une adresse donnee             |
| `updateTicketType`    | eventId, user, newType                  | Organisateur  | Change le type d'un ticket (sauf ORGANIZER)                     |
| `removeTicket`        | eventId, user                           | Organisateur  | Supprime un ticket VIP ou STAFF (burn du NFT)                   |
| `resellTicket`        | eventId, to                             | Proprietaire  | Transfere un ticket STANDARD a un autre utilisateur             |
| `scanTicket`          | ticketId                                | STAFF/ORGANIZER | Marque le ticket comme utilise                                |

### Regles metier

- Un utilisateur ne peut posseder qu'un seul ticket par evenement.
- Seuls les tickets STANDARD peuvent etre revendus.
- Les transferts NFT directs (hors `resellTicket`) sont bloques.
- Le scan d'un ticket ne peut etre effectue que par un STAFF (deja scanne lui-meme) ou un ORGANIZER.
- Un proprietaire de ticket ne peut pas scanner son propre ticket, sauf s'il est ORGANIZER.
- La creation d'un evenement genere automatiquement un ticket ORGANIZER pour le createur.
- La date de fin doit etre dans le futur au moment de la creation.

### Mappings

| Mapping                    | Cles             | Valeur  | Description                                      |
|----------------------------|------------------|---------|--------------------------------------------------|
| `events`                   | uint256          | Event   | Evenements indexes par ID                        |
| `tickets`                  | uint256          | Ticket  | Tickets indexes par ID (= tokenId)               |
| `ticketIdByEventAndOwner`  | uint256, address | uint256 | Ticket d'un utilisateur pour un evenement donne   |

### Events Solidity

| Event               | Donnees principales                    | Description                         |
|---------------------|----------------------------------------|-------------------------------------|
| EventCreated        | eventId, name, organizer, endDate      | Evenement cree                      |
| EventMetadataUpdated| eventId, metadataURI                   | Metadonnees mises a jour            |
| EventCancelled      | eventId, organizer                     | Evenement annule                    |
| TicketCreated       | ticketId, eventId, owner, ticketType   | Ticket cree                         |
| TicketUsed          | ticketId, owner                        | Ticket scanne                       |
| TicketTypeUpdated   | ticketId, user, oldType, newType       | Type de ticket modifie              |
| TicketResold        | ticketId, eventId, from, to            | Ticket revendu                      |
| TicketRemoved       | ticketId, eventId, owner, ticketType   | Ticket supprime                     |

---

## Frontend

### Stack technique

| Technologie        | Version | Role                                    |
|--------------------|---------|-----------------------------------------|
| Next.js            | 16.1.4  | Framework React avec App Router         |
| React              | 19.2.3  | Librairie UI                            |
| TypeScript         | 5.x     | Typage statique                         |
| Tailwind CSS       | 4.x     | Framework CSS utilitaire                |
| Wagmi              | 3.4.1   | Hooks React pour interactions blockchain|
| Viem               | 2.44.4  | Client Ethereum bas niveau              |
| ConnectKit         | 1.9.1   | Interface de connexion wallet           |
| React Query        | 5.90.19 | Cache et synchronisation des donnees    |
| Three.js           | 0.182.0 | Moteur de rendu 3D                      |
| React Three Fiber  | 9.5.0   | Binding React pour Three.js             |
| @react-three/drei  | 10.7.7  | Helpers pour React Three Fiber          |
| Framer Motion      | 12.29.2 | Animations et transitions               |
| qrcode.react       | 4.2.0   | Generation de QR codes                  |

### Pages

L'application est une single-page avec navigation par ancres et onglets :

- **Hero** : Section d'accueil avec elements 3D interactifs (micro, ticket), particules flottantes et notes de musique.
- **Creer un evenement** : Formulaire de creation (nom, date de fin, metadata URI).
- **Explorer** : Navigation par onglets entre la liste des evenements et la liste des tickets.

### Composants principaux

| Composant          | Fichier                          | Description                                                |
|--------------------|----------------------------------|------------------------------------------------------------|
| Header             | components/Header.tsx            | Barre de navigation fixe avec connexion wallet              |
| HeroSection        | components/HeroSection.tsx       | Section d'accueil avec scenes 3D et animations              |
| CreateEventForm    | components/CreateEventForm.tsx   | Formulaire de creation d'evenement                          |
| EventList          | components/EventList.tsx         | Grille des evenements avec etats de chargement              |
| EventCard          | components/EventCard.tsx         | Carte d'evenement avec actions et panel organisateur         |
| TicketList         | components/TicketList.tsx        | Grille des tickets avec etats de chargement                 |
| TicketCard         | components/TicketCard.tsx        | Carte de ticket avec QR code, type, revente et scan         |
| Scene3D            | components/3d/Scene3D.tsx        | Wrapper pour les scenes Three.js                            |
| Microphone3D       | components/3d/Microphone3D.tsx   | Modele 3D GLB du micro avec suivi de souris                 |
| Ticket3D           | components/3d/Ticket3D.tsx       | Ticket 3D procedural avec suivi de souris                   |
| FloatingParticles  | components/3d/FloatingParticles.tsx | Particules instanciees flottantes                        |
| MusicNotes3D       | components/3d/MusicNotes3D.tsx   | Notes de musique 3D animees                                 |

---

## Integration blockchain

### Provider

Le fichier `providers/Web3Provider.tsx` configure la stack Web3 :

- **WagmiProvider** : Fournit la configuration de connexion aux chains.
- **QueryClientProvider** : Cache des appels RPC via React Query.
- **ConnectKitProvider** : Interface de connexion wallet (theme "midnight", langue francaise).

### Configuration (config/web3.ts)

Ce fichier contient :

- L'adresse du contrat deploye (`TICKETING_CONTRACT_ADDRESS`).
- L'ABI complete du contrat avec toutes les fonctions, vues et events.
- L'enum `TicketType` et les mappings de labels/couleurs associes.
- La configuration Wagmi avec les chains supportees (Hardhat local, Sepolia testnet).

### Hooks personnalises (hooks/useTicketing.ts)

Chaque fonction du contrat est exposee via un hook React :

#### Hooks de lecture

| Hook                        | Fonction contrat           | Description                                      |
|-----------------------------|----------------------------|--------------------------------------------------|
| useEventCount               | eventCount                 | Nombre total d'evenements                        |
| useEvent                    | events                     | Donnees d'un evenement par ID                    |
| useTicketCount              | ticketCount                | Nombre total de tickets                          |
| useTicket                   | tickets                    | Donnees d'un ticket par ID                       |
| useTicketIdByEventAndOwner  | ticketIdByEventAndOwner    | ID du ticket d'un utilisateur pour un evenement   |
| useOwnerOf                  | ownerOf                    | Proprietaire d'un ticket (ERC-721)                |
| useTokenURI                 | tokenURI                   | URI du token (ERC-721)                            |

#### Hooks d'ecriture

| Hook                    | Fonction contrat     | Description                                       |
|-------------------------|----------------------|---------------------------------------------------|
| useCreateEvent          | createEvent          | Creer un evenement                                |
| useUpdateEventMetadata  | updateEventMetadata  | Mettre a jour les metadonnees                     |
| useCancelEvent          | cancelEvent          | Annuler un evenement                              |
| useCreateTicket         | createTicket         | Creer un ticket                                   |
| useCreateTicketFor      | createTicketFor      | Creer un ticket pour un autre utilisateur          |
| useUpdateTicketType     | updateTicketType     | Modifier le type d'un ticket                       |
| useResellTicket         | resellTicket         | Revendre un ticket STANDARD                        |
| useScanTicket           | scanTicket           | Scanner (valider) un ticket                        |
| useRemoveTicket         | removeTicket         | Supprimer un ticket VIP/STAFF                      |

Chaque hook d'ecriture retourne `{ fonction, isPending, isSuccess, isError, error }` pour gerer l'etat de la transaction dans l'interface.

### QR Code

Chaque ticket valide (non utilise) peut afficher un QR code contenant les informations de verification :

```json
{
  "contract": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "ticketId": "1",
  "eventId": "1",
  "type": "Standard"
}
```

Ce QR code est destine a etre scanne lors de l'entree a l'evenement. Le scan declenche la fonction `scanTicket` du contrat pour marquer le ticket comme utilise de maniere immuable sur la blockchain.

---

## Fonctionnalites

### Utilisateur standard

1. Connecter son wallet via le bouton en haut a droite.
2. Parcourir les evenements disponibles dans l'onglet "Evenements".
3. Obtenir un ticket STANDARD pour un evenement actif.
4. Consulter ses tickets dans l'onglet "Tickets".
5. Afficher le QR code de son ticket pour l'entree.
6. Revendre son ticket STANDARD a un autre utilisateur.

### Organisateur

1. Creer un evenement en renseignant le nom, la date de fin et optionnellement une URI de metadonnees.
2. Un ticket ORGANIZER est automatiquement cree.
3. Depuis la carte de l'evenement, ouvrir le panel "Gestion organisateur" pour :
   - Creer des tickets VIP ou STAFF pour des adresses specifiques.
   - Annuler l'evenement.
4. Scanner les tickets des participants a l'entree de l'evenement.

### Staff

1. Recevoir un ticket STAFF de la part de l'organisateur.
2. Se faire scanner son propre ticket par l'organisateur ou un autre staff valide.
3. Scanner les tickets des participants a l'entree.

---

## Structure des fichiers

```
ticketing-dapp/
  ticketing-backend/
    contracts/
      Ticketing.sol              Smart contract principal
    scripts/
      deployTicketing.ts         Script de deploiement
    test/
      Ticketing.ts               Tests du contrat
    hardhat.config.ts            Configuration Hardhat
    package.json

  ticketing-frontend/
    app/
      layout.tsx                 Layout racine (providers, header)
      page.tsx                   Page principale
      globals.css                Styles globaux et animations
    components/
      Header.tsx                 Barre de navigation
      HeroSection.tsx            Hero avec elements 3D
      CreateEventForm.tsx        Formulaire de creation
      EventCard.tsx              Carte d'evenement
      EventList.tsx              Liste des evenements
      TicketCard.tsx             Carte de ticket
      TicketList.tsx             Liste des tickets
      3d/
        Scene3D.tsx              Wrapper Canvas Three.js
        Microphone3D.tsx         Modele 3D du micro (GLB)
        Ticket3D.tsx             Ticket 3D procedural
        FloatingParticles.tsx    Particules de fond
        MusicNotes3D.tsx         Notes de musique animees
    config/
      web3.ts                    ABI, adresse du contrat, config Wagmi
    hooks/
      useTicketing.ts            Hooks personnalises pour le contrat
    providers/
      Web3Provider.tsx           Configuration des providers Web3
    public/
      models/
        Microphone.glb           Modele 3D du micro
    package.json
    tsconfig.json
    postcss.config.mjs
    next.config.ts
```

---

## Configuration

### Adresse du contrat

Apres le deploiement, mettre a jour l'adresse dans `ticketing-frontend/config/web3.ts` :

```typescript
export const TICKETING_CONTRACT_ADDRESS =
  "0x..." as const;
```

### WalletConnect (optionnel)

Pour le support WalletConnect sur Sepolia ou mainnet, definir la variable d'environnement :

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre_project_id
```

Obtenir un project ID sur https://cloud.walletconnect.com.

### Chains supportees

La configuration actuelle supporte :

- **Hardhat** (local) : `http://127.0.0.1:8545`, chain ID 31337
- **Sepolia** (testnet) : via le transport HTTP par defaut

Pour ajouter une chain, modifier le tableau `chains` et l'objet `transports` dans `config/web3.ts`.

---

## Deploiement

### Deploiement du contrat sur Sepolia

1. Configurer les variables d'environnement pour le deploiement (cle privee, URL RPC Sepolia).

2. Ajouter la configuration reseau dans `hardhat.config.ts` :

```typescript
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

3. Deployer :

```bash
cd ticketing-backend
npx hardhat run scripts/deployTicketing.ts --network sepolia
```

4. Reporter l'adresse dans `config/web3.ts`.

### Deploiement du frontend

```bash
cd ticketing-frontend
npm run build
npm run start
```

Le frontend est un site statique compatible avec tout hebergeur supportant Next.js (Vercel, Netlify, serveur Node.js).

---

## Commandes de reference

### Backend

| Commande                                                    | Description                          |
|-------------------------------------------------------------|--------------------------------------|
| `npx hardhat node`                                          | Lancer la blockchain locale          |
| `npx hardhat run scripts/deployTicketing.ts --network localhost` | Deployer en local              |
| `npx hardhat compile`                                       | Compiler le contrat                  |
| `npx hardhat test`                                          | Executer les tests                   |

### Frontend

| Commande        | Description                      |
|-----------------|----------------------------------|
| `npm run dev`   | Lancer le serveur de developpement |
| `npm run build` | Compiler pour la production      |
| `npm run start` | Lancer en mode production        |
| `npm run lint`  | Verifier le code avec ESLint     |

# Ticketing DApp -- Document de presentation du projet

## Systeme de billetterie decentralisee sur blockchain Ethereum

---

## Sommaire

1. Contexte et vision du projet
2. Cas d'usage
3. Acteurs du systeme
4. Architecture technique retenue
5. Exigences techniques
6. Normes et standards appliques
7. Choix technologiques
8. Synthese des contraintes

---

## 1. Contexte et vision du projet

La billetterie evenementielle traditionnelle souffre de plusieurs problemes structurels : falsification de tickets, manque de transparence sur la revente, difficulte a controler la distribution et l'authenticite des billets. Ces problemes engendrent des pertes financieres pour les organisateurs et une experience degradee pour les participants.

Le projet Ticketing DApp propose de resoudre ces problematiques en s'appuyant sur la blockchain Ethereum. Chaque ticket est represente par un token non fongible (NFT) au standard ERC-721, garantissant son unicite, sa tracabilite et son authenticite de maniere immuable. Le systeme supprime tout intermediaire : les interactions entre organisateurs, staff et participants s'effectuent directement via un smart contract.

L'objectif est de fournir une plateforme complete permettant la creation d'evenements, l'emission de tickets tokenises de differentes categories, la validation des entrees, la revente encadree et la gestion du personnel evenementiel, le tout dans un cadre transparent et verifiable par tous les acteurs.

---

## 2. Cas d'usage

### CU-01 : Creer un evenement

**Acteur principal** : Organisateur

**Description** : Un utilisateur connecte cree un evenement en renseignant son nom, sa date de fin et une URI vers ses metadonnees. Le systeme verifie que la date de fin est dans le futur. A la creation, un ticket de type ORGANIZER est automatiquement emis pour le createur.

**Preconditions** : Wallet connecte.

**Postconditions** : L'evenement est enregistre sur la blockchain. L'organisateur dispose d'un ticket ORGANIZER.

---

### CU-02 : Obtenir un ticket standard

**Acteur principal** : Participant

**Description** : Un participant consulte les evenements actifs et demande un ticket de type STANDARD pour l'evenement de son choix. Le systeme verifie que l'evenement est actif (non annule, non termine) et que l'utilisateur ne possede pas deja un ticket pour cet evenement. Un NFT est emis au nom du participant.

**Preconditions** : Wallet connecte. L'evenement est actif. Le participant ne possede pas de ticket pour cet evenement.

**Postconditions** : Un ticket STANDARD (NFT ERC-721) est attribue au participant.

---

### CU-03 : Emettre des tickets VIP ou STAFF

**Acteur principal** : Organisateur

**Description** : L'organisateur d'un evenement cree un ticket de type VIP ou STAFF pour une adresse Ethereum specifique. Cette action est reservee exclusivement a l'organisateur. Le destinataire ne doit pas deja detenir un ticket pour cet evenement.

**Preconditions** : L'appelant est l'organisateur de l'evenement. Le destinataire ne possede pas de ticket pour cet evenement.

**Postconditions** : Un ticket VIP ou STAFF est attribue au destinataire.

---

### CU-04 : Scanner un ticket a l'entree

**Acteur principal** : Staff ou Organisateur

**Description** : Lors de l'evenement, un membre du staff ou l'organisateur scanne le ticket d'un participant pour valider son entree. Le systeme verifie que le ticket n'a pas deja ete utilise, que l'evenement n'est pas annule, que le scanner dispose des droits necessaires (ticket STAFF valide ou ORGANIZER) et qu'un proprietaire de ticket ne scanne pas son propre billet (sauf l'organisateur). Le ticket est marque comme utilise de maniere irreversible.

**Preconditions** : Le scanner possede un ticket STAFF (deja scanne lui-meme) ou ORGANIZER. Le ticket cible n'est pas utilise. L'evenement n'est pas annule.

**Postconditions** : Le ticket est marque comme utilise sur la blockchain.

---

### CU-05 : Revendre un ticket

**Acteur principal** : Detenteur d'un ticket STANDARD

**Description** : Le proprietaire d'un ticket STANDARD peut le transferer a un autre utilisateur. Le systeme verifie que seuls les tickets STANDARD sont revendables, que le destinataire ne possede pas deja un ticket pour cet evenement et que l'evenement est actif. Le transfert est effectue via le mecanisme interne du contrat (les transferts NFT directs sont bloques).

**Preconditions** : Le ticket est de type STANDARD. Le destinataire ne possede pas de ticket pour cet evenement. L'evenement est actif.

**Postconditions** : Le ticket est transfere au nouveau proprietaire. L'ancien proprietaire ne possede plus de ticket pour cet evenement.

---

### CU-06 : Annuler un evenement

**Acteur principal** : Organisateur

**Description** : L'organisateur peut annuler son evenement. L'evenement est marque comme annule sur la blockchain. Les tickets existants ne sont pas detruits mais deviennent inutilisables (le scan et la revente sont bloques).

**Preconditions** : L'appelant est l'organisateur. L'evenement n'est pas deja annule.

**Postconditions** : L'evenement est marque comme annule. Toute operation sur les tickets est bloquee.

---

### CU-07 : Modifier le type d'un ticket

**Acteur principal** : Organisateur

**Description** : L'organisateur peut changer le type d'un ticket existant (STANDARD vers VIP, VIP vers STAFF, etc.). Le ticket ORGANIZER ne peut pas etre modifie.

**Preconditions** : L'appelant est l'organisateur. Le ticket cible n'est pas de type ORGANIZER.

**Postconditions** : Le type du ticket est mis a jour.

---

### CU-08 : Retirer un ticket VIP ou STAFF

**Acteur principal** : Organisateur

**Description** : L'organisateur peut supprimer un ticket VIP ou STAFF. Le NFT est brule (burn) et le mapping de possession est reinitialise. Les tickets STANDARD et ORGANIZER ne peuvent pas etre retires par cette voie.

**Preconditions** : L'appelant est l'organisateur. Le ticket est de type VIP ou STAFF.

**Postconditions** : Le NFT est detruit. Le proprietaire ne possede plus de ticket pour cet evenement.

---

### CU-09 : Afficher et verifier un ticket via QR code

**Acteur principal** : Participant

**Description** : Le detenteur d'un ticket valide peut afficher un QR code contenant les informations de verification (adresse du contrat, identifiant du ticket, identifiant de l'evenement, type). Ce QR code est presentable a l'entree pour declenchement du scan par le staff.

**Preconditions** : Le ticket n'est pas utilise.

**Postconditions** : Le QR code est affiche. Aucune modification on-chain.

---

### CU-10 : Mettre a jour les metadonnees d'un evenement

**Acteur principal** : Organisateur

**Description** : L'organisateur peut mettre a jour l'URI de metadonnees de son evenement tant que celui-ci n'est pas termine et n'est pas annule.

**Preconditions** : L'appelant est l'organisateur. L'evenement est actif et non termine.

**Postconditions** : L'URI de metadonnees est mise a jour sur la blockchain.

---

## 3. Acteurs du systeme

| Acteur        | Description                                                                                  |
|---------------|----------------------------------------------------------------------------------------------|
| Participant   | Utilisateur final qui obtient un ticket STANDARD, le presente a l'entree ou le revend.        |
| Organisateur  | Createur de l'evenement. Dispose de droits d'administration : emission de tickets VIP/STAFF, annulation, scan, modification de tickets. Recoit automatiquement un ticket ORGANIZER. |
| Staff         | Personnel evenementiel designe par l'organisateur. Recoit un ticket STAFF et, une fois scanne, peut scanner les tickets des participants a l'entree. |

---

## 4. Architecture technique retenue

```
+------------------+          JSON-RPC           +-------------------+
|                  | <-------------------------> |                   |
|    Frontend      |    Wagmi / Viem             |   Blockchain      |
|    (Next.js)     |                             |   Ethereum        |
|                  | <--- ConnectKit ----------> |   (Smart Contract)|
+------------------+          Wallet             +-------------------+
                                                          |
                                                          | ERC-721
                                                          | (NFT)
                                                          |
                                                   +------+------+
                                                   |    IPFS     |
                                                   | (Metadonnees|
                                                   |  off-chain) |
                                                   +-------------+
```

**Frontend** : Application web monopage servant d'interface utilisateur. Communique directement avec la blockchain via des appels RPC. Aucun serveur backend intermediaire.

**Smart Contract** : Contrat Solidity deploye sur Ethereum gerant l'ensemble de la logique metier. Herite du standard ERC-721 pour la tokenisation des tickets.

**IPFS** : Stockage decentralise des metadonnees des evenements et tickets (images, descriptions, documents). Reference par les champs `metadataURI` et `tokenURI`.

**Wallet** : Interface de signature des transactions via MetaMask ou tout wallet compatible EIP-1193.

---

## 5. Exigences techniques

### ET-01 : Tokenisation des ressources

Les tickets sont representes sous forme de tokens NFT au standard ERC-721 via le contrat ERC721URIStorage d'OpenZeppelin. Chaque ticket est un token unique identifie par un `tokenId`.

Le systeme definit quatre niveaux de tokens, materialises par l'enumeration `TicketType` :

| Niveau      | Valeur | Droits                                                        | Equivalent |
|-------------|--------|---------------------------------------------------------------|------------|
| STANDARD    | 0      | Acces a l'evenement. Revendable.                               | Billet classique |
| VIP         | 1      | Acces a l'evenement. Non revendable. Emission par l'organisateur. | Billet premium |
| STAFF       | 2      | Acces a l'evenement. Droit de scan (apres validation propre). Non revendable. | Badge personnel |
| ORGANIZER   | 3      | Acces complet. Droit de scan. Administration de l'evenement. Non modifiable. | Badge organisateur |

Cette hierarchie a quatre niveaux garantit une separation claire des droits et responsabilites. Chaque niveau de token confere des permissions specifiques encodees directement dans la logique du smart contract.

---

### ET-02 : Echanges de tokens

Le systeme implemente un mecanisme d'echange controle de tickets entre utilisateurs via la fonction `resellTicket`. Les regles de validation des transactions sont les suivantes :

- Seuls les tickets de type STANDARD sont eligibles a la revente.
- Le destinataire ne doit pas deja posseder un ticket pour l'evenement concerne.
- L'evenement doit etre actif (non annule, non termine).
- Les transferts ERC-721 directs (via `transferFrom`, `safeTransferFrom`) sont bloques par une surcharge de la fonction `_update`. Seul le mecanisme interne `resellTicket` autorise le deplacement d'un token.

Cette architecture empeche toute revente sauvage hors du cadre defini par le contrat, garantissant le respect des regles metier.

---

### ET-03 : Limites de possession

Le systeme impose une contrainte stricte : **un utilisateur ne peut posseder qu'un seul ticket par evenement**. Cette regle est appliquee par le mapping `ticketIdByEventAndOwner` qui associe un couple (eventId, adresse) a un unique ticketId.

Toute tentative de creation ou de reception d'un second ticket pour un meme evenement est rejetee par le contrat avec l'erreur "User already has a ticket for this event".

Cette contrainte s'applique a toutes les operations : creation de ticket, creation pour un tiers, et revente. Elle previent l'accumulation speculative et garantit une distribution equitable.

---

### ET-04 : Contraintes temporelles

Le systeme applique des contraintes temporelles a plusieurs niveaux :

**Date de fin d'evenement** : Chaque evenement est associe a un timestamp de fin (`endDate`) defini a la creation. Le contrat impose que cette date soit dans le futur (`endDate > block.timestamp`). Une fois la date depassee, les operations sur l'evenement sont bloquees par les verifications dans les fonctions publiques.

**Cycle de vie du ticket STAFF** : Un membre du staff doit avoir son propre ticket scanne avant de pouvoir scanner les tickets des participants. Ce mecanisme introduit une contrainte de sequencement temporel obligatoire : le staff est d'abord valide, puis il peut operer.

**Irreversibilite du scan** : Une fois scanne, un ticket est marque comme utilise de maniere definitive. Ce verrouillage permanent empeche toute reutilisation.

**Annulation** : L'annulation d'un evenement agit comme un verrou global et irreversible bloquant toute operation ulterieure sur les tickets associes.

---

### ET-05 : Utilisation d'IPFS

Le contrat prevoit le stockage decentralise des metadonnees via deux champs URI :

- **`metadataURI`** (structure Event) : URI pointant vers les metadonnees de l'evenement (description, image, lieu, informations complementaires). Defini a la creation et modifiable par l'organisateur via `updateEventMetadata`.

- **`tokenURI`** (ERC721URIStorage) : URI associe a chaque token NFT. Defini a la creation du ticket via le parametre `ticketURI`. Permet de stocker les metadonnees specifiques au ticket (visuel, informations de categorie).

Ces URI sont prevus pour pointer vers des ressources IPFS au format `ipfs://Qm...` ou vers tout autre systeme de stockage decentralise. Le standard IPFS garantit l'immutabilite des contenus references : une fois un fichier publie, son hash (et donc son URI) est inalterable.

Le frontend accepte la saisie de ces URI lors de la creation d'evenements et de tickets, et les affiche dans les cartes correspondantes.

---

### ET-06 : Tests unitaires avec Hardhat

L'ensemble des smart contracts est teste via le framework Hardhat avec la suite d'outils `@nomicfoundation/hardhat-toolbox`. Les tests sont localises dans le repertoire `ticketing-backend/test/`.

Le framework Hardhat fournit :

- Un environnement de blockchain locale pour l'execution des tests.
- La librairie Ethers.js pour l'interaction avec les contrats dans les scenarios de test.
- Chai comme librairie d'assertions.
- La possibilite de simuler le passage du temps (`evm_increaseTime`) pour tester les contraintes temporelles.
- La possibilite de tester les reverts et messages d'erreur.

Execution des tests :

```
cd ticketing-backend
npx hardhat test
```

Les tests couvrent les scenarios nominaux et les cas d'erreur pour chaque fonction du contrat (creation, scan, revente, annulation, gestion des droits).

---

## 6. Normes et standards appliques

| Norme / Standard      | Application                                                    |
|-----------------------|----------------------------------------------------------------|
| ERC-721               | Standard de token non fongible. Chaque ticket est un NFT unique, transferable et verifiable on-chain. |
| ERC-721 URI Storage   | Extension ERC-721 permettant d'associer une URI de metadonnees a chaque token. Utilise pour lier les tickets a leurs donnees IPFS. |
| EIP-1193              | Standard de communication entre le navigateur et le wallet Ethereum. Utilise par ConnectKit pour la connexion. |
| OpenZeppelin Contracts| Librairie de reference pour les smart contracts Solidity. Le contrat herite de l'implementation auditee ERC721URIStorage v5.4.0. |
| Solidity 0.8.28       | Version du compilateur avec protections arithmetiques natives (overflow/underflow). |
| JSON-RPC 2.0          | Protocole de communication entre le frontend et le noeud Ethereum. |

---

## 7. Choix technologiques

### Smart Contract (Backend)

| Composant             | Choix            | Justification                                                  |
|-----------------------|------------------|----------------------------------------------------------------|
| Langage               | Solidity 0.8.28  | Standard de l'ecosysteme Ethereum. Protections natives contre les overflows. |
| Framework             | Hardhat          | Environnement de developpement complet : compilation, deploiement, tests, blockchain locale. |
| Librairie             | OpenZeppelin 5.4 | Implementations auditees et reconnues des standards ERC. Reduction des risques de vulnerabilite. |
| Blockchain cible      | Ethereum (EVM)   | Ecosysteme le plus mature pour les NFTs. Compatible Hardhat local et testnets (Sepolia). |

### Application Frontend

| Composant             | Choix                 | Justification                                                  |
|-----------------------|-----------------------|----------------------------------------------------------------|
| Framework             | Next.js 16            | Framework React de reference. App Router, rendu hybride, optimisation de performance. |
| Langage               | TypeScript 5          | Typage statique pour la fiabilite du code et la coherence avec l'ABI du contrat. |
| Styling               | Tailwind CSS 4        | Framework CSS utilitaire. Prototypage rapide, design system coherent, dark mode natif. |
| Interaction blockchain| Wagmi 3 + Viem 2      | Hooks React typesafe pour les appels au contrat. Viem comme client Ethereum leger et performant. |
| Connexion wallet      | ConnectKit 1.9        | Interface de connexion wallet polished. Support multi-wallet, internationalisation. |
| Cache de donnees      | React Query 5         | Synchronisation et cache des donnees blockchain. Invalidation automatique. |
| Rendu 3D              | Three.js + R3F + Drei | Moteur 3D pour les elements visuels interactifs. React Three Fiber pour l'integration React declarative. |
| Animations            | Framer Motion 12      | Animations fluides et transitions de layout. API declarative compatible React. |
| QR Code               | qrcode.react 4        | Generation de QR codes cote client pour la verification des tickets a l'entree. |

### Infrastructure

| Composant             | Choix              | Justification                                                  |
|-----------------------|--------------------|----------------------------------------------------------------|
| Stockage metadonnees  | IPFS               | Stockage decentralise et immuable. Coherent avec la philosophie Web3. |
| Reseau de test        | Hardhat Network    | Blockchain locale instantanee pour le developpement et les tests. |
| Reseau de staging     | Sepolia Testnet    | Testnet Ethereum public pour la validation pre-production.      |

---

## 8. Synthese des contraintes

| Exigence                    | Implementation                                                                                | Statut   |
|-----------------------------|-----------------------------------------------------------------------------------------------|----------|
| Tokenisation multi-niveaux  | 4 types de tickets (STANDARD, VIP, STAFF, ORGANIZER) via enum TicketType et ERC-721           | Couvert  |
| Echanges de tokens          | Fonction resellTicket avec regles de validation. Transferts directs bloques.                    | Couvert  |
| Limites de possession       | 1 ticket par utilisateur par evenement via mapping ticketIdByEventAndOwner                     | Couvert  |
| Contraintes temporelles     | Date de fin d'evenement, sequencement scan STAFF, irreversibilite du scan, annulation globale  | Couvert  |
| Utilisation d'IPFS          | Champs metadataURI (evenements) et tokenURI (tickets) pour stockage decentralise               | Couvert  |
| Tests unitaires Hardhat     | Suite de tests dans ticketing-backend/test/ avec Hardhat toolbox                               | Couvert  |

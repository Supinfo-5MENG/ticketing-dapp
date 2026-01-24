# Documentation du contrat Ticketing

## Présentation

Le contrat `Ticketing` est un contrat Ethereum basé sur l’ERC721, conçu pour gérer la billetterie d’événements.  
Il permet de créer des événements, émettre des tickets NFT (STANDARD, VIP, STAFF, ORGANIZER), gérer la revente et le scan des tickets, et appliquer des règles métier strictes sur l’accès et l’usage des tickets.

Le contrat repose sur OpenZeppelin ERC721URIStorage et inclut une logique métier complète pour :

- La création et la gestion des événements
- La création et la gestion des tickets
- La revente sécurisée des tickets STANDARD
- Le scan de tickets par les organisateurs et le personnel STAFF
- La prévention des transferts directs de tickets

Les rôles principaux :

- **ORGANIZER** : Créateur de l’événement. Peut gérer les tickets VIP/STAFF, scanner tous les tickets et se scanner lui-même.
- **STAFF** : Peut scanner d’autres tickets après avoir été scanné.
- **STANDARD** : Participant classique, peut utiliser ou revendre son ticket.
- **VIP** : Ticket réservé par l’organisateur pour des invités spéciaux, non revendable.
- **OWNER (propriétaire du contrat)** : Déploie le contrat mais n’a pas de permissions spécifiques sur les événements.

---

## Structures

### TicketType (enum)
Types de tickets disponibles :
~~~solidity
enum TicketType {
    STANDARD,
    VIP,
    STAFF,
    ORGANIZER
}
~~~

### Ticket (struct)
Représente un ticket NFT.
~~~solidity
struct Ticket {
    uint256 id;         // ID du ticket (correspond au tokenId ERC721)
    uint256 eventId;    // ID de l’événement associé
    bool used;          // Indique si le ticket a été scanné/utilisé
    TicketType ticketType; // Type de ticket
}
~~~

### Event (struct)
Représente un événement.
~~~solidity
struct Event {
    uint256 id;         // ID de l’événement
    uint256 endDate;    // Timestamp de fin de l’événement
    address organizer;  // Adresse de l’organisateur
    bool exists;        // Si l’événement existe
    bool cancelled;     // Si l’événement a été annulé
    string name;        // Nom de l’événement
    string metadataURI; // URI du metadata de l’événement
}
~~~

---

## Événements

- `EventCreated(eventId, name, organizer, endDate, metadataUri)` : émis lors de la création d’un événement.
- `EventMetadataUpdated(eventId, metadataURI)` : émis lors de la mise à jour du metadata d’un événement.
- `EventCancelled(eventId, organizer)` : émis lors de l’annulation d’un événement.
- `TicketCreated(ticketId, eventId, owner, ticketType)` : émis lors de la création d’un ticket.
- `TicketUsed(ticketId, owner)` : émis lors du scan ou de l’utilisation d’un ticket.
- `TicketTypeUpdated(ticketId, user, oldType, newType)` : émis lors d’un changement de type de ticket.
- `TicketResold(ticketId, eventId, from, to)` : émis lors de la revente d’un ticket STANDARD.
- `TicketRemoved(ticketId, eventId, owner, ticketType)` : émis lors de la suppression d’un ticket VIP ou STAFF par l’organisateur.

---

## Fonctions principales

### createEvent
~~~solidity
function createEvent(string memory name, uint256 endDate, string memory metadataURI) public
~~~
- Crée un nouvel événement.
- Génère automatiquement un ticket `ORGANIZER` pour l’organisateur.
- Vérifie que `endDate` est dans le futur.
- Émet l’événement `EventCreated`.

---

### updateEventMetadata
~~~solidity
function updateEventMetadata(uint256 eventId, string memory newMetadataURI) public
~~~
- Permet à l’organisateur de mettre à jour le metadata URI avant la fin de l’événement.
- Requiert que l’événement ne soit pas annulé.
- Émet `EventMetadataUpdated`.

---

### cancelEvent
~~~solidity
function cancelEvent(uint256 eventId) public
~~~
- Permet à l’organisateur d’annuler un événement.
- Émet `EventCancelled`.
- Après annulation, aucun ticket ne peut être utilisé ou scanné.

---

### createTicket
~~~solidity
function createTicket(uint256 eventId, TicketType ticketType, string memory ticketURI) public
~~~
- Permet à un participant de créer un ticket STANDARD.
- L’organisateur peut créer des tickets VIP ou STAFF pour lui-même.
- Émet `TicketCreated`.

---

### createTicketFor
~~~solidity
function createTicketFor(uint256 eventId, address to, TicketType ticketType, string memory ticketURI) public
~~~
- Permet à l’organisateur de créer des tickets VIP ou STAFF pour d’autres utilisateurs.
- Seul l’organisateur peut utiliser cette fonction.
- Émet `TicketCreated`.

---

### updateTicketType
~~~solidity
function updateTicketType(uint256 eventId, address user, TicketType newType) public
~~~
- Permet à l’organisateur de mettre à jour le type d’un ticket (STANDARD, VIP, STAFF).
- Le ticket ORGANIZER ne peut jamais être modifié.
- Émet `TicketTypeUpdated`.

---

### resellTicket
~~~solidity
function resellTicket(uint256 eventId, address to) public
~~~
- Permet à un participant de revendre son ticket STANDARD.
- Les tickets VIP, STAFF ou ORGANIZER ne sont pas transférables.
- Vérifie que le destinataire n’a pas déjà un ticket pour l’événement.
- Émet `TicketResold`.

---

### scanTicket
~~~solidity
function scanTicket(uint256 ticketId) public
~~~
- Permet de scanner un ticket pour marquer son utilisation.
- Règles :
  1. L’organisateur peut scanner n’importe quel ticket, y compris le sien.
  2. Le propriétaire du ticket ne peut pas se scanner lui-même sauf s’il est ORGANIZER.
  3. Le scanner doit posséder un ticket STAFF ou ORGANIZER.
  4. Un ticket STAFF doit avoir été scanné au préalable pour scanner d’autres tickets.
  5. Le ticket scanné ne doit pas avoir été utilisé.
  6. L’événement ne doit pas être annulé.
- Émet `TicketUsed`.

**Diagramme simplifié du workflow scanTicket :**
~~~
ORGANIZER ---> scanTicket() ---> n'importe quel ticket
STAFF     ---> scanTicket() ---> ticket STANDARD ou STAFF (si staff déjà scanné)
STANDARD  ---> scanTicket() ---> REJETÉ

Ticket déjà utilisé ---> REJETÉ
Event annulé        ---> REJETÉ
~~~

---

### removeTicket
~~~solidity
function removeTicket(uint256 eventId, address user) public
~~~
- Permet à l’organisateur de retirer un ticket VIP ou STAFF.
- Supprime le ticket du mapping et brûle le NFT ERC721.
- Émet `TicketRemoved`.

---

### _createTicket (privée)
~~~solidity
function _createTicket(uint256 eventId, address owner, TicketType ticketType, string memory ticketURI) private
~~~
- Fonction interne pour créer un ticket NFT.
- Gère l’incrément du `ticketCount`, l’association `ticketIdByEventAndOwner` et le mint du NFT.

---

### _update (override ERC721)
~~~solidity
function _update(address to, uint256 tokenId, address auth) internal override returns (address)
~~~
- Empêche tout transfert direct de NFT en dehors d’une revente autorisée (`resellTicket`).
- Vérifie que seul le ticket STANDARD peut être transféré et que l’événement n’est pas annulé.

---

## Règles métier principales

1. **Création d’événements**
   - La date de fin doit être dans le futur.
   - Chaque événement crée un ticket ORGANIZER pour l’organisateur.
2. **Tickets**
   - Un utilisateur ne peut avoir qu’un ticket par événement.
   - STANDARD : participant classique, utilisable et revendable.
   - VIP : non revendable, créé par l’organisateur.
   - STAFF : non revendable, peut scanner d’autres tickets après avoir été lui même scanné.
   - ORGANIZER : non modifiable, propriétaire de l’événement.
3. **Scan de tickets**
   - L’organisateur peut scanner tous les tickets et se scanner lui-même.
   - Les STAFF peuvent scanner d’autres STAFF après avoir été scannés.
   - Les tickets STANDARD et VIP sont scannés par STAFF ou ORGANIZER.
4. **Revente**
   - Seuls les tickets STANDARD sont transférables via `resellTicket`.
   - Les tickets VIP/STAFF/ORGANIZER ne peuvent pas être transférés.
5. **Annulation**
   - Une fois annulé, aucun ticket ne peut être scanné ou utilisé.

---

## Conclusion

Ce contrat fournit un système complet de billetterie sur blockchain avec :

- Gestion d’événements et tickets NFT
- Scannage sécurisé et règles métier strictes
- Gestion de la revente et prévention des transferts non autorisés
- Événements Solidity pour le suivi d’activité et la transparence

Il peut être utilisé tel quel pour un projet de billetterie blockchain ou servir de base pour intégrer des fonctionnalités supplémentaires comme la validation hors ligne, l’API de frontend ou la génération automatique de tickets sur IPFS.

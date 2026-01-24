// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Ticketing is ERC721URIStorage {
    using Strings for uint256;

    bool private _isResellInProgress;

    // Tickets
    enum TicketType {
        STANDARD,
        VIP,
        STAFF,
        ORGANIZER
    }

    struct Ticket {
        uint256 id;
        uint256 eventId;
        bool used;
        TicketType ticketType;
    }

    uint256 public ticketCount;
    mapping(uint256 => Ticket) public tickets;

    // Events
    struct Event {
        uint256 id;
        uint256 endDate;
        address organizer;
        bool exists; 
        bool cancelled;
        string name;
        string metadataURI;
    }

    uint256 public eventCount;
    mapping(uint256 => Event) public events;

    // eventId => user => ticketId
    mapping(uint256 => mapping(address => uint256)) public ticketIdByEventAndOwner;

    // Events
    event EventCreated(uint256 indexed eventId, string name, address indexed organizer, uint256 endDate, string metadataUri);
    event EventMetadataUpdated(uint256 indexed eventId, string metadataURI);
    event EventCancelled(uint256 indexed eventId, address indexed organizer);

    event TicketCreated(uint256 indexed ticketId, uint256 indexed eventId, address indexed owner, TicketType ticketType);
    event TicketUsed(uint256 indexed ticketId, address indexed owner);
    event TicketTypeUpdated(uint256 indexed ticketId, address indexed user, TicketType oldTypen, TicketType newType);
    event TicketResold(uint256 indexed ticketId, uint256 indexed eventId, address from, address to);
    event TicketRemoved(uint256 indexed ticketId, uint256 indexed eventId, address owner, TicketType ticketType);

    constructor() ERC721("EventTicket", "ETKT") {
        ticketCount = 0;
        eventCount = 0;
    }

    function createEvent(string memory name, uint256 endDate, string memory metadataURI) public {
        require(endDate > block.timestamp, "End date must be in the future.");
        eventCount += 1;

        events[eventCount] = Event({
            id: eventCount,
            name: name,
            endDate: endDate,
            organizer: msg.sender,
            exists: true,
            cancelled: false,
            metadataURI: metadataURI
        });

        string memory organizerTicketURI = string.concat("organizer-", eventCount.toString(), ".json");
        _createTicket(eventCount, msg.sender, TicketType.ORGANIZER, organizerTicketURI);
        emit EventCreated(eventCount, name, msg.sender, endDate, metadataURI);
    }

    function updateEventMetadata(uint256 eventId, string memory newMetadataURI) public {
        _requireActiveEvent(eventId);
        require(msg.sender == events[eventId].organizer, "Only organizer can update metadata.");
        require(block.timestamp < events[eventId].endDate, "Event has already ended.");

        events[eventId].metadataURI = newMetadataURI;
        emit EventMetadataUpdated(eventId, newMetadataURI);
    }

    function cancelEvent(uint256 eventId) public {
        _requireActiveEvent(eventId);
        require(msg.sender == events[eventId].organizer, "Only organizer can cancel event.");

        events[eventId].cancelled = true;

        emit EventCancelled(eventId, msg.sender);
    }

    function _requireActiveEvent(uint256 eventId) internal view {
        require(events[eventId].exists, "Event does not exist.");
        require(!events[eventId].cancelled, "Event is cancelled.");
    }

    function createTicket(uint256 eventId, TicketType ticketType, string memory ticketURI) public {
        _requireActiveEvent(eventId);
        require(ticketIdByEventAndOwner[eventId][msg.sender] == 0, "User already has a ticket for this event.");

        if (ticketType == TicketType.VIP || ticketType == TicketType.STAFF) {
            require(msg.sender == events[eventId].organizer, "Only the event organizer can create VIP or STAFF tickets.");
        } else if (ticketType != TicketType.STANDARD) {
            revert("Invalid ticket type.");
        }

        _createTicket(eventId, msg.sender, ticketType, ticketURI);
    }

    function createTicketFor(uint256 eventId, address to, TicketType ticketType, string memory ticketURI) public {
        _requireActiveEvent(eventId);
        require(events[eventId].organizer == msg.sender, "Only organizer can create tickets for others.");
        require(ticketIdByEventAndOwner[eventId][to] == 0, "User already has a ticket for this event.");
        require(ticketType == TicketType.VIP || ticketType == TicketType.STAFF, "Only VIP or STAFF tickets can be created for others.");

        _createTicket(eventId, to, ticketType, ticketURI);
    }

    function _createTicket(uint256 eventId, address owner, TicketType ticketType, string memory ticketURI) private {
        ticketCount += 1;

        tickets[ticketCount] = Ticket({
            id: ticketCount,
            eventId: eventId,
            used: false,
            ticketType: ticketType
        });

        ticketIdByEventAndOwner[eventId][owner] = ticketCount;
        _safeMint(owner, ticketCount);
        _setTokenURI(ticketCount, ticketURI);

        emit TicketCreated(ticketCount, eventId, owner, ticketType);
    }

    function updateTicketType(uint256 eventId, address user, TicketType newType) public {
        _requireActiveEvent(eventId);
        require(msg.sender == events[eventId].organizer, "Only organizer can update tickets.");
        require(newType == TicketType.STANDARD || newType == TicketType.VIP || newType == TicketType.STAFF, "Invalid ticket type.");

        uint256 ticketId = ticketIdByEventAndOwner[eventId][user];
        require(ticketId != 0, "User does not have a ticket for this event.");

        Ticket storage ticket = tickets[ticketId];
        require(ticket.ticketType != TicketType.ORGANIZER, "Cannot modify organizer ticket.");

        TicketType oldType = ticket.ticketType;
        ticket.ticketType = newType;
        emit TicketTypeUpdated(ticketId, user, oldType, newType);
    }

    function resellTicket(uint256 eventId, address to) public {
        _requireActiveEvent(eventId);
        
        uint256 ticketId = ticketIdByEventAndOwner[eventId][msg.sender];
        require(ticketId != 0, "You do not own a ticket for this event.");

        Ticket storage ticket = tickets[ticketId];
        require(ticket.ticketType == TicketType.STANDARD, "Only STANDARD tickets can be resold.");
        require(ticketIdByEventAndOwner[eventId][to] == 0, "Recipient already has a ticket for this event.");

        _isResellInProgress = true;

        ticketIdByEventAndOwner[eventId][to] = ticketId;
        ticketIdByEventAndOwner[eventId][msg.sender] = 0;
        _transfer(msg.sender, to, ticketId);

        _isResellInProgress = false;

        emit TicketResold(ticketId, eventId, msg.sender, to);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);

        // Mint
        if (from == address(0) || to == address(0)) {
            return from;
        }

        require(_isResellInProgress, "Direct NFT transfers are disabled.");

        Ticket storage ticket = tickets[tokenId];
        Event storage ev = events[ticket.eventId];

        require(!ev.cancelled, "Event is cancelled");
        require(ticket.ticketType == TicketType.STANDARD, "Only STANDARD tickets can be transferred.");

        return from;
    }

    function useTicket(uint256 ticketId) public {
        Ticket storage ticket = tickets[ticketId];

        require(ownerOf(ticketId) == msg.sender, "Only the ticket owner can use the ticket.");
        require(ticket.used == false, "Ticket has already been used.");

        Event storage ev = events[ticket.eventId];
        require(!ev.cancelled, "Event is cancelled.");

        ticket.used = true;
        emit TicketUsed(ticketId, msg.sender);
    }

    function removeTicket(uint256 eventId, address user) public {
        _requireActiveEvent(eventId);
        require(msg.sender == events[eventId].organizer, "Only organizer can remove tickets.");

        uint256 ticketId = ticketIdByEventAndOwner[eventId][user];
        require(ticketId != 0, "User does not have a ticket for this event.");

        Ticket storage ticket = tickets[ticketId];
        require(ticket.ticketType == TicketType.VIP || ticket.ticketType == TicketType.STAFF, "Only VIP or STAFF tickets can be removed by organizer.");

        ticketIdByEventAndOwner[eventId][user] = 0;
        TicketType ticketType = ticket.ticketType;
        _burn(ticketId);
        delete tickets[ticketId];

        emit TicketRemoved(ticketId, eventId, user, ticketType);
    }
}
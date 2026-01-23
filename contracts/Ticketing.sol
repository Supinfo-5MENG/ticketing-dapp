// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Ticketing {
    // Tickets
    enum TicketType {
        STANDARD,
        VIP,
        STAFF,
        ORGANIZER
    }

    struct Ticket {
        uint256 id;
        address owner;
        bool used;
        TicketType ticketType;
    }

    uint256 public ticketCount;
    mapping(uint256 => Ticket) public tickets;

    // Events
    struct Event {
        uint256 id;
        string name;
        uint256 endDate;
        address organizer;
        bool exists; 
    }

    uint256 public eventCount;
    mapping(uint256 => Event) public events;

    // 1 utilisateur a un seul ticket par event
    mapping(uint256 => mapping(address => bool)) public hasTicketForEvent;

    constructor() {
        ticketCount = 0;
        eventCount = 0;
    }

    function createEvent(string memory name, uint256 endDate) public {
        require(endDate > block.timestamp, "End date must be in the future.");
        eventCount += 1;

        events[eventCount] = Event({
            id: eventCount,
            name: name,
            endDate: endDate,
            organizer: msg.sender,
            exists: true
        });

        ticketCount += 1;

        tickets[ticketCount] = Ticket({
            id: ticketCount,
            owner: msg.sender,
            used: false,
            ticketType: TicketType.ORGANIZER
        });
        hasTicketForEvent[eventCount][msg.sender] = true;
    }

    function createTicket(uint256 eventId, TicketType ticketType) public {
        require(events[eventId].exists, "Event does not exist.");
        require(hasTicketForEvent[eventId][msg.sender] == false, "User already has a ticket for this event.");

        require(ticketType == TicketType.STANDARD, "Only STANDARD tickets are allowed for now.");



        ticketCount += 1;

        tickets[ticketCount] = Ticket({
            id: ticketCount,
            owner: msg.sender,
            used: false,
            ticketType: ticketType
        });
        hasTicketForEvent[eventId][msg.sender] = true;
    }

    function useTicket(uint256 ticketId) public {
        Ticket storage ticket = tickets[ticketId];

        require(ticket.owner == msg.sender, "Only the ticket owner can use the ticket.");
        require(ticket.used == false, "Ticket has already been used.");

        ticket.used = true;
    }
}
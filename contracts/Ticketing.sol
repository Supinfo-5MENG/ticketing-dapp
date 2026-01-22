// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Ticketing {
    // Tickets
    struct Ticket {
        uint256 id;
        address owner;
        bool used;
    }

    uint256 public ticketCount;
    mapping(uint256 => Ticket) public tickets;

    // Events
    struct Event {
        uint256 id;
        string name;
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

    function createEvent(string memory name) public {
        eventCount += 1;

        events[eventCount] = Event({
            id: eventCount,
            name: name,
            exists: true
        });
    }

    function createTicket(uint256 eventId) public {
        require(events[eventId].exists, "Event does not exist.");
        require(hasTicketForEvent[eventId][msg.sender] == false, "User already has a ticket for this event.");

        ticketCount += 1;

        tickets[ticketCount] = Ticket({
            id: ticketCount,
            owner: msg.sender,
            used: false
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
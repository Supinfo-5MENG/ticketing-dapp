// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Ticketing {
    string public eventName;

    struct Ticket {
        uint256 id;
        address owner;
        bool used;
    }

    uint256 public ticketCount;
    mapping(uint256 => Ticket) public tickets;

    constructor() {
        eventName = "Ticketing Dapp";
        ticketCount = 0;
    }

    function getEventName() public view returns (string memory) {
        return eventName;
    }

    function createTicket() public {
        ticketCount += 1;

        tickets[ticketCount] = Ticket({
            id: ticketCount,
            owner: msg.sender,
            used: false
        });
    }
}
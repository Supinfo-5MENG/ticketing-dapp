// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Ticketing {
    string public eventName;

    constructor() {
        eventName = "Ticketing Dapp";
    }

    function getEventName() public view returns (string memory) {
        return eventName;
    }
}
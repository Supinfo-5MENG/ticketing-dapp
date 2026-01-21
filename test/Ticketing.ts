import { expect } from 'chai';
import { ethers } from "hardhat";

describe('Ticketing contract', () => {

    it('Should store the event name', async () => {
        const Ticketing = await ethers.getContractFactory('Ticketing');
        const ticketing = await Ticketing.deploy();

        expect(await ticketing.getEventName()).to.equal("Ticketing Dapp");
    })

    it('Should create a ticket and assign it to the caller', async () => {
        const Ticketing = await ethers.getContractFactory('Ticketing');
        const ticketing = await Ticketing.deploy();

        const [owner] = await ethers.getSigners();

        await ticketing.createTicket();
        const ticket = await ticketing.tickets(1);

        expect(ticket.id).to.equal(1);
        expect(ticket.owner).to.equal(owner.address);
        expect
    })
});
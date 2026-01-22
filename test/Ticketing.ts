import { expect } from 'chai';
import { ethers } from "hardhat";
import { Ticketing } from '../typechain-types';

describe('Ticketing contract', () => {
    let ticketing: Ticketing;
    let owner: any;
    let other: any;

    beforeEach(async () => {
        const Ticketing = await ethers.getContractFactory('Ticketing');
        ticketing = await Ticketing.deploy();
        [owner, other] = await ethers.getSigners();

        await ticketing.createEvent("Concert A");
    });

    it('Should create a ticket and assign it to the caller', async () => {
        // GIVEN
        await ticketing.createTicket(1);

        // WHEN
        const ticket = await ticketing.tickets(1);

        // THEN
        expect(ticket.id).to.equal(1);
        expect(ticket.owner).to.equal(owner.address);
    })

    it('Owner can use their ticket', async () => {
        // GIVEN
        await ticketing.createTicket(1);

        // WHEN
        await ticketing.useTicket(1);

        // THEN
        const ticket = await ticketing.tickets(1);
        expect(ticket.used).to.equal(true);
        expect(ticket.owner).to.equal(owner.address);
    });

    it('Non owner cannot use someone else\'s ticket', async () => {
        // GIVEN
        await ticketing.createTicket(1);

        // WHEN / THEN
        await expect(
            ticketing.connect(other).useTicket(1)
        ).to.be.revertedWith("Only the ticket owner can use the ticket.");
    });

    it('Should create an event', async () => {
        // GIVEN

        // WHEN
        const event = await ticketing.events(1);

        // THEN
        expect(event.id).to.equal(1);
        expect(event.name).to.equal("Concert A");
        expect(event.exists).to.equal(true);
    });

        it('Should user can register once per event', async () => {
        // WHEN
        await ticketing.createTicket(1);

        // THEN
        await expect(
            ticketing.createTicket(1)
        ).to.be.revertedWith("User already has a ticket for this event.");
    });

    it('Should user can register to multiple events', async () => {
        // GIVEN
        await ticketing.createEvent("Concert B");

        // WHEN
        await ticketing.createTicket(1);
        await ticketing.createTicket(2);

        // THEN
        const ticket1 = await ticketing.tickets(1);
        const ticket2 = await ticketing.tickets(2);
        expect(ticket1.owner).to.equal(owner.address);
        expect(ticket2.owner).to.equal(owner.address);
    });
});
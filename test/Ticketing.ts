import { expect } from 'chai';
import { ethers } from "hardhat";
import { Ticketing } from '../typechain-types';

describe('Ticketing contract', () => {
    let ticketing: Ticketing;
    let owner: any;
    let other: any;

    let now: number;
    let futureDate: number;
    let pastDate: number;

    beforeEach(async () => {
        const Ticketing = await ethers.getContractFactory('Ticketing');
        ticketing = await Ticketing.deploy();
        [owner, other] = await ethers.getSigners();

        // Calcul du temps à partir du bloc actuel
        const blockNumberBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumberBefore);
        now = blockBefore?.timestamp!;
        futureDate = now + 3600;
        pastDate = now - 3600;

        // Créer un événement pour les tests
        await ticketing.createEvent("Concert A", futureDate);
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

    it('Should owner can use their ticket', async () => {
        // GIVEN
        await ticketing.createTicket(1);

        // WHEN
        await ticketing.useTicket(1);

        // THEN
        const ticket = await ticketing.tickets(1);
        expect(ticket.used).to.equal(true);
        expect(ticket.owner).to.equal(owner.address);
    });

    it('Should non owner cannot use someone else\'s ticket', async () => {
        // GIVEN
        await ticketing.createTicket(1);

        // WHEN / THEN
        await expect(
            ticketing.connect(other).useTicket(1)
        ).to.be.revertedWith("Only the ticket owner can use the ticket.");
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
        await ticketing.createEvent("Concert B", futureDate);

        // WHEN
        await ticketing.createTicket(1);
        await ticketing.createTicket(2);

        // THEN
        const ticket1 = await ticketing.tickets(1);
        const ticket2 = await ticketing.tickets(2);
        expect(ticket1.owner).to.equal(owner.address);
        expect(ticket2.owner).to.equal(owner.address);
    });

    it('Should create an event with a future end date', async () => {
        // WHEN
        await ticketing.createEvent("Concert C", futureDate);
        const event = await ticketing.events(2);
        
        // THEN
        expect(event.id).to.equal(2);
        expect(event.name).to.equal("Concert C");
        expect(event.endDate).to.equal(futureDate);
        expect(event.exists).to.equal(true);
    });

    it('Should not create an event with a past end date', async () => {
        // WHEN / THEN
        await expect(
            ticketing.createEvent("Concert C", pastDate)
        ).to.be.revertedWith("End date must be in the future.");
    })
});
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
        await ticketing.connect(other).createTicket(1, 0);

        // WHEN
        const ticket = await ticketing.tickets(2); // Le premier ticket est pour l'organisateur

        // THEN
        expect(ticket.id).to.equal(2);
        expect(ticket.owner).to.equal(other.address);
    })

    it('Should owner can use their ticket', async () => {
        // GIVEN
        await ticketing.connect(other).createTicket(1, 0);

        // WHEN
        await ticketing.connect(other).useTicket(2);
        const ticket = await ticketing.tickets(2);

        // THEN
        expect(ticket.used).to.equal(true);
        expect(ticket.owner).to.equal(other.address);
    });

    it('Should non owner cannot use someone else\'s ticket', async () => {
        // GIVEN
        await ticketing.connect(other).createTicket(1, 0);

        // WHEN / THEN
        await expect(
            ticketing.connect(owner).useTicket(2)
        ).to.be.revertedWith("Only the ticket owner can use the ticket.");
    });

    it('Should user can register once per event', async () => {
        // WHEN
        await ticketing.connect(other).createTicket(1, 0);

        // THEN
        await expect(
            ticketing.connect(other).createTicket(1, 0)
        ).to.be.revertedWith("User already has a ticket for this event.");
    });

    it("Should not allow non-organizer to create VIP ticket", async () => {
        // WHEN / THEN
        await expect(
            ticketing.connect(other).createTicket(1, 1) // VIP
        ).to.be.revertedWith("Only the event organizer can create VIP or STAFF tickets.");
    });

    it("Should not allow non-organizer to create STAFF ticket", async () => {
        await expect(
            ticketing.connect(other).createTicket(1, 2) // STAFF
        ).to.be.revertedWith("Only the event organizer can create VIP or STAFF tickets.");
    });

    it('Should user can register to multiple events', async () => {
        // GIVEN
        await ticketing.createEvent("Concert B", futureDate);

        // WHEN
        await ticketing.connect(other).createTicket(1, 0);
        await ticketing.connect(other).createTicket(2, 0);
        const ticket1 = await ticketing.tickets(3); // Ticket ID 2 est pour l'organisateur de 'Concert B'
        const ticket2 = await ticketing.tickets(4);

        // THEN
        expect(ticket1.owner).to.equal(other.address);
        expect(ticket2.owner).to.equal(other.address);
    });

    it('Should create an event with a future end date', async () => {
        // WHEN
        await ticketing.createEvent("Concert C", futureDate);
        const event = await ticketing.events(2);
        
        // THEN
        expect(event.id).to.equal(2);
        expect(event.name).to.equal("Concert C");
        expect(event.endDate).to.equal(futureDate);
        expect(event.organizer).to.equal(owner.address);
        expect(event.exists).to.equal(true);
    });

    it("Should set the event creator as organizer", async () => {
        // WHEN
        const event = await ticketing.events(1);

        // THEN
        expect(event.organizer).to.equal(owner.address);
    });

    it("Should create an ORGANIZER ticket for the event creator", async () => {
        // GIVEN
        const ticket = await ticketing.tickets(1);

        // WHEN
        expect(ticket.owner).to.equal(owner.address);
        expect(ticket.ticketType).to.equal(3); // ORGANIZER
    });

    it("Should organizer not be able to create another ticket for the same event", async () => {
        await expect(
            ticketing.createTicket(1, 0) // STANDARD
        ).to.be.revertedWith("User already has a ticket for this event.");
    });

    it("Should organizer can create VIP ticket for a user", async () => {
        await ticketing.connect(owner).createTicketFor(1, other.address, 1); // VIP

        const ticket = await ticketing.tickets(2);
        expect(ticket.owner).to.equal(other.address);
        expect(ticket.ticketType).to.equal(1);
    });

    it("Should non-organizer cannot create tickets for others", async () => {
        await expect(
            ticketing.connect(other).createTicketFor(1, owner.address, 1)
        ).to.be.revertedWith("Only organizer can create tickets for others.");
    });

    it("Cannot create STANDARD ticket via createTicketFor", async () => {
        await expect(
            ticketing.connect(owner).createTicketFor(1, other.address, 0)
        ).to.be.revertedWith("Only VIP or STAFF tickets can be created for others.");
    });

    it('Should not create an event with a past end date', async () => {
        // WHEN / THEN
        await expect(
            ticketing.createEvent("Concert C", pastDate)
        ).to.be.revertedWith("End date must be in the future.");
    })
});
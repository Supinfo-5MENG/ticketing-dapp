import { expect } from 'chai';
import { ethers } from "hardhat";
import { Ticketing } from '../typechain-types';

const TicketType = {
    STANDARD: 0,
    VIP: 1,
    STAFF: 2,
    ORGANIZER: 3,
    UNKNOWN: 99,
}

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

    describe('createEvent() tests suite', () => {
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

        it('Should not create an event with a past end date', async () => {
            // WHEN / THEN
            await expect(
                ticketing.createEvent("Concert C", pastDate)
            ).to.be.revertedWith("End date must be in the future.");
        });

        it('Should set the event creator as organizer', async () => {
            // WHEN
            const event = await ticketing.events(1);

            // THEN
            expect(event.organizer).to.equal(owner.address);
        });

        it("Should emit EventCreated when creating an event", async () => {
            // WHEN / THEN
            await expect(ticketing.createEvent("Concert D", futureDate))
                .to.emit(ticketing, "EventCreated")
                .withArgs(2, "Concert D", owner.address, futureDate);
        });
    });

    describe("cancelEvent() tests suite", () => {
        it("Should allow organizer to cancel an event", async () => {
            // WHEN
            await ticketing.cancelEvent(1);

            // THEN
            const event = await ticketing.events(1);
            expect(event.cancelled).to.equal(true);
        });

        it("Should emit EventCancelled event", async () => {
            // WHEN / THEN
            await expect(
                ticketing.cancelEvent(1)
            ).to.emit(ticketing, "EventCancelled")
            .withArgs(1, owner.address);
        });

        it("Should not allow non-organizer to cancel an event", async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(other).cancelEvent(1)
            ).to.be.revertedWith("Only organizer can cancel event.");
        });

        it("Should not allow cancelling an already cancelled event", async () => {
            // GIVEN
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.cancelEvent(1)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });

    describe('createTicket() tests suite', () => {
        it('Should create a ticket and assign it to the caller', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN
            const ticket = await ticketing.tickets(2); // Ticket 1 = ORGANIZER

            // THEN
            expect(ticket.id).to.equal(2);
            expect(ticket.owner).to.equal(other.address);
        });

        it('Should create an ORGANIZER ticket for the event creator', async () => {
            // GIVEN
            const ticket = await ticketing.tickets(1);

            // THEN
            expect(ticket.owner).to.equal(owner.address);
            expect(ticket.ticketType).to.equal(TicketType.ORGANIZER);
        });

        it('Should organizer not be able to create another ticket for the same event', async () => {
            // WHEN / THEN
            await expect(
                ticketing.createTicket(1, TicketType.STANDARD)
            ).to.be.revertedWith("User already has a ticket for this event.");
        });

        it('Should user can register once per event', async () => {
            // WHEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // THEN
            await expect(
                ticketing.connect(other).createTicket(1, TicketType.STANDARD)
            ).to.be.revertedWith("User already has a ticket for this event.");
        });

        it('Should user can register to multiple events', async () => {
            // GIVEN
            await ticketing.createEvent("Concert B", futureDate);

            // WHEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);
            await ticketing.connect(other).createTicket(2, TicketType.STANDARD);

            const ticket1 = await ticketing.tickets(3);
            const ticket2 = await ticketing.tickets(4);

            // THEN
            expect(ticket1.owner).to.equal(other.address);
            expect(ticket2.owner).to.equal(other.address);
        });

        it('Should not allow non-organizer to create VIP ticket', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(other).createTicket(1, TicketType.VIP)
            ).to.be.revertedWith("Only the event organizer can create VIP or STAFF tickets.");
        });

        it('Should not allow non-organizer to create STAFF ticket', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(other).createTicket(1, TicketType.STAFF)
            ).to.be.revertedWith("Only the event organizer can create VIP or STAFF tickets.");
        });

        it("Should emit TicketCreated when a user buys a STANDARD ticket", async () => {
            // WHEN / THEN
            await expect(ticketing.connect(other).createTicket(1, TicketType.STANDARD))
                .to.emit(ticketing, "TicketCreated")
                .withArgs(2, 1, other.address, TicketType.STANDARD); // ticketId 2, eventId 1
        });

        it("Should not allow creating a ticket for a cancelled event", async () => {
            // GIVEN
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).createTicket(1, TicketType.STANDARD)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });

    describe('createTicketFor() tests suite', () => {
        it('Should organizer can create VIP ticket for a user', async () => {
            // WHEN / THEN
            await expect(ticketing.connect(owner).createTicketFor(1, other.address, TicketType.VIP))
                .to.emit(ticketing, "TicketCreated")
                .withArgs(2, 1, other.address, TicketType.VIP);

            // THEN
            const ticket = await ticketing.tickets(2);
            expect(ticket.owner).to.equal(other.address);
            expect(ticket.ticketType).to.equal(TicketType.VIP);

        });

        it('Should non-organizer cannot create tickets for others', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(other).createTicketFor(1, owner.address, TicketType.VIP)
            ).to.be.revertedWith("Only organizer can create tickets for others.");
        });

        it('Cannot create STANDARD ticket via createTicketFor', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(owner).createTicketFor(1, other.address, TicketType.STANDARD)
            ).to.be.revertedWith("Only VIP or STAFF tickets can be created for others.");
        });

        it("Should not allow organizer to create ticket for cancelled event", async () => {
            // GIVEN
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.createTicketFor(1, other.address, TicketType.VIP)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });

    describe('updateTicketType() tests suite', () => {
        it("Should organizer can upgrade STANDARD ticket to VIP", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN
            await ticketing.updateTicketType(1, other.address, TicketType.VIP);

            // THEN
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);
            const ticket = await ticketing.tickets(ticketId);
            expect(ticket.ticketType).to.equal(TicketType.VIP);
        });

        it("Should organizer can downgrade VIP ticket to STANDARD", async () => {
            // GIVEN
            await ticketing.createTicketFor(1, other.address, TicketType.VIP);

            // WHEN
            await ticketing.updateTicketType(1, other.address, TicketType.STANDARD);

            // THEN
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);
            const ticket = await ticketing.tickets(ticketId);
            expect(ticket.ticketType).to.equal(TicketType.STANDARD);
        });

        it("Should not allow setting newType to ORGANIZER", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN / THEN
            await expect(
                ticketing.updateTicketType(1, other.address, TicketType.ORGANIZER)
            ).to.be.revertedWith("Invalid ticket type.");
        });

        it("Should not allow non-organizer to update ticket type", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).updateTicketType(1, other.address, TicketType.VIP)
            ).to.be.revertedWith("Only organizer can update tickets.");
        });

        it("Should not allow modifying organizer ticket", async () => {
            // GIVEN
            const organizerTicketId = await ticketing.ticketIdByEventAndOwner(1, owner.address);
            const organizerTicket = await ticketing.tickets(organizerTicketId);
            expect(organizerTicket.ticketType).to.equal(TicketType.ORGANIZER);

            // WHEN / THEN
            await expect(
                ticketing.updateTicketType(1, owner.address, TicketType.STANDARD)
            ).to.be.revertedWith("Cannot modify organizer ticket.");
        });

        it("Should emit TicketTypeUpdated event on ticket update", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN / THEN
            await expect(
                ticketing.updateTicketType(1, other.address, TicketType.VIP)
            ).to.emit(ticketing, "TicketTypeUpdated")
            .withArgs(2, other.address, TicketType.STANDARD, TicketType.VIP);
        });

        it("Should revert when passing invalid ticket type (unknown)", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN / THEN
            await expect(
                ticketing.updateTicketType(1, other.address, TicketType.UNKNOWN)
            ).to.be.reverted;
        });

        it("Should not allow updating ticket type if event is cancelled", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.updateTicketType(1, other.address, TicketType.VIP)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });

    describe('resellTicket() tests suite', () => {
        let buyer: any;

        beforeEach(async () => {
            [, , buyer] = await ethers.getSigners();
        });

        it('Should allow a user to resell a STANDARD ticket', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);

            // WHEN / THEN
            await expect(ticketing.connect(other).resellTicket(1, buyer.address))
                .to.emit(ticketing, 'TicketResolt')
                .withArgs(ticketId, 1, other.address, buyer.address);

            // THEN
            const ticket = await ticketing.tickets(ticketId);
            expect(ticket.owner).to.equal(buyer.address);
            expect(await ticketing.ticketIdByEventAndOwner(1, buyer.address)).to.equal(ticketId);
            expect(await ticketing.ticketIdByEventAndOwner(1, other.address)).to.equal(0);
        });

        it('Should not allow reselling VIP ticket', async () => {
            // GIVEN
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.VIP);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).resellTicket(1, buyer.address)
            ).to.be.revertedWith("Only STANDARD tickets can be resold.");
        });

        it('Should not allow reselling STAFF ticket', async () => {
            // GIVEN
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.STAFF);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).resellTicket(1, buyer.address)
            ).to.be.revertedWith("Only STANDARD tickets can be resold.");
        });

        it('Should not allow reselling to someone who already has a ticket', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);
            await ticketing.connect(buyer).createTicket(1, TicketType.STANDARD);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).resellTicket(1, buyer.address)
            ).to.be.revertedWith("Recipient already has a ticket for this event.");
        });

        it('Should not allow reselling for an event that does not exist', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(other).resellTicket(999, buyer.address)
            ).to.be.revertedWith("Event does not exist.");
        });

        it('Should not allow reselling a ticket the caller does not own', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN / THEN
            await expect(
                ticketing.connect(buyer).resellTicket(1, owner.address)
            ).to.be.revertedWith("You do not own a ticket for this event.");
        });

        it("Should not allow reselling a ticket if event is cancelled", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).resellTicket(1, owner.address)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });

    describe('useTicket() tests suite', () => {
        it('Should owner can use their ticket', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN
            await ticketing.connect(other).useTicket(2);
            const ticket = await ticketing.tickets(2);

            // THEN
            expect(ticket.used).to.equal(true);
            expect(ticket.owner).to.equal(other.address);
        });

        it('Should non owner cannot use someone else\'s ticket', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN / THEN
            await expect(
                ticketing.connect(owner).useTicket(2)
            ).to.be.revertedWith("Only the ticket owner can use the ticket.");
        });

        it("Should emit TicketUsed when a ticket is used", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);
            
            // WHEN / THEN
            await expect(ticketing.connect(other).useTicket(2))
                .to.emit(ticketing, "TicketUsed")
                .withArgs(2, other.address);
        });

        it("Should not allow using a ticket if event is cancelled", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).useTicket(2)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });

    describe('RemoveTicket() tests suite', () => {
        it('Should allow organizer to remove VIP ticket', async () => {
            // GIVEN
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.VIP);
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);

            // WHEN / THEN
            await expect(ticketing.connect(owner).removeTicket(1, other.address))
                .to.emit(ticketing, 'TicketRemoved')
                .withArgs(ticketId, 1, other.address, TicketType.VIP);

            // THEN
            const ticketAfter = await ticketing.tickets(ticketId);
            expect(ticketAfter.owner).to.equal(ethers.ZeroAddress); // ticket supprimé
            expect(await ticketing.ticketIdByEventAndOwner(1, other.address)).to.equal(0);
        });

        it('Should allow organizer to remove STAFF ticket', async () => {
            // GIVEN
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.STAFF);
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);

            // WHEN / THEN
            await expect(ticketing.connect(owner).removeTicket(1, other.address))
                .to.emit(ticketing, 'TicketRemoved')
                .withArgs(ticketId, 1, other.address, TicketType.STAFF);

            // THEN
            const ticketAfter = await ticketing.tickets(ticketId);
            expect(ticketAfter.owner).to.equal(ethers.ZeroAddress); // ticket supprimé
            expect(await ticketing.ticketIdByEventAndOwner(1, other.address)).to.equal(0);
        });

        it('Should not allow removing STANDARD ticket', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD);

            // WHEN / THEN
            await expect(
                ticketing.connect(owner).removeTicket(1, other.address)
            ).to.be.revertedWith("Only VIP or STAFF tickets can be removed by organizer.");
        });

        it('Should not allow non-organizer to remove a ticket', async () => {
            // GIVEN
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.VIP);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).removeTicket(1, other.address)
            ).to.be.revertedWith("Only organizer can remove tickets.");
        });

        it('Should not allow removing a ticket for a non-existent event', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(owner).removeTicket(999, other.address)
            ).to.be.revertedWith("Event does not exist.");
        });

        it('Should not allow removing a ticket that the user does not have', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(owner).removeTicket(1, other.address)
            ).to.be.revertedWith("User does not have a ticket for this event.");
        });

        it("Should not allow removing ticket if event is cancelled", async () => {
            // GIVEN
            await ticketing.createTicketFor(1, other.address, TicketType.VIP);
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.removeTicket(1, other.address)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });
});
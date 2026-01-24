import { assert, expect } from 'chai';
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

    const initialMetadata = "ipfs://initialmetadatahash";
    const updatedMetadata = "ipfs://updatedmetadatahash";

    const ticketURIStandard = "ipfs://standardtickethash";
    const ticketURIVIP = "ipfs://viptickethash";
    const ticketURIStaff = "ipfs://stafftickethash";

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
        await ticketing.createEvent("Concert A", futureDate, initialMetadata);
    });

    describe('createEvent() tests suite', () => {
        it('Should create an event with a future end date', async () => {
            // WHEN
            await ticketing.createEvent("Concert C", futureDate, initialMetadata);
            const event = await ticketing.events(2);
            
            // THEN
            expect(event.id).to.equal(2);
            expect(event.name).to.equal("Concert C");
            expect(event.endDate).to.equal(futureDate);
            expect(event.organizer).to.equal(owner.address);
            expect(event.exists).to.equal(true);
            const organizerTicketId = await ticketing.ticketIdByEventAndOwner(2, owner.address);
            expect(await ticketing.tokenURI(organizerTicketId)).to.equal("organizer-2.json");
        });

        it('Should not create an event with a past end date', async () => {
            // WHEN / THEN
            await expect(
                ticketing.createEvent("Concert C", pastDate, initialMetadata)
            ).to.be.revertedWith("End date must be in the future.");
        });

        it('Should set the event creator as organizer', async () => {
            // WHEN
            const event = await ticketing.events(1);

            // THEN
            expect(event.organizer).to.equal(owner.address);
            const organizerTicketId = await ticketing.ticketIdByEventAndOwner(1, owner.address);
            expect(await ticketing.tokenURI(organizerTicketId)).to.equal("organizer-1.json");
        });

        it("Should emit EventCreated when creating an event", async () => {
            // WHEN / THEN
            await expect(ticketing.createEvent("Concert D", futureDate, initialMetadata))
                .to.emit(ticketing, "EventCreated")
                .withArgs(2, "Concert D", owner.address, futureDate, initialMetadata);
        });
    });

    describe('Event metadata', () => {
        it('Should allow organizer to update metadata before event ends', async () => {
            // VERIFY STATE
            expect((await ticketing.events(1)).metadataURI).to.equal(initialMetadata);

            // WHEN
            await ticketing.updateEventMetadata(1, updatedMetadata);

            // THEN
            const event = await ticketing.events(1);
            expect(event.metadataURI).to.equal(updatedMetadata);
        });

        it('Should not allow non-organizer to update metadata', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(other).updateEventMetadata(1, initialMetadata)
            ).to.be.revertedWith("Only organizer can update metadata.");
        });

        it('Should not allow update after event is cancelled', async () => {
            // GIVEN
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.updateEventMetadata(1, initialMetadata)
            ).to.be.revertedWith("Event is cancelled.");
        });

        it('Should not allow update after event end date', async () => {
            // GIVEN
            // Simuler le passage du temps
            await ethers.provider.send("evm_setNextBlockTimestamp", [futureDate + 1]);
            await ethers.provider.send("evm_mine");

            // WHEN / THEN
            await expect(
                ticketing.updateEventMetadata(1, initialMetadata)
            ).to.be.revertedWith("Event has already ended.");
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
            // WHEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
            const ticket = await ticketing.tickets(2); // ticketId 2 = STANDARD

            // THEN
            expect(ticket.id).to.equal(2);
            expect(await ticketing.ownerOf(ticket.id)).to.equal(other.address);
            expect(await ticketing.tokenURI(ticket.id)).to.equal(ticketURIStandard);
        });

        it('Should create an ORGANIZER ticket for the event creator', async () => {
            // GIVEN
            const ticket = await ticketing.tickets(1); // ticketId 1 = ORGANIZER

            // THEN
            expect(await ticketing.ownerOf(ticket.id)).to.equal(owner.address);
            expect(ticket.ticketType).to.equal(TicketType.ORGANIZER);

            // THEN : Vérification tokenURI
            expect(await ticketing.tokenURI(ticket.id)).to.equal("organizer-1.json");
        });

        it('Should organizer not be able to create another ticket for the same event', async () => {
            // WHEN / THEN
            await expect(
                ticketing.createTicket(1, TicketType.STANDARD, ticketURIStandard)
            ).to.be.revertedWith("User already has a ticket for this event.");
        });

        it('Should user can register once per event', async () => {
            // WHEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // THEN
            await expect(
                ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard)
            ).to.be.revertedWith("User already has a ticket for this event.");
        });

        it('Should user can register to multiple events', async () => {
            // GIVEN
            await ticketing.createEvent("Concert B", futureDate, initialMetadata);

            // WHEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
            await ticketing.connect(other).createTicket(2, TicketType.STANDARD, ticketURIStandard);

            const ticket1 = await ticketing.tickets(3);
            const ticket2 = await ticketing.tickets(4);

            // THEN
            expect(await ticketing.ownerOf(ticket1.id)).to.equal(other.address);
            expect(await ticketing.ownerOf(ticket2.id)).to.equal(other.address);
        });

        it('Should not allow non-organizer to create VIP ticket', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(other).createTicket(1, TicketType.VIP, ticketURIVIP)
            ).to.be.revertedWith("Only the event organizer can create VIP or STAFF tickets.");
        });

        it('Should not allow non-organizer to create STAFF ticket', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(other).createTicket(1, TicketType.STAFF, ticketURIStaff)
            ).to.be.revertedWith("Only the event organizer can create VIP or STAFF tickets.");
        });

        it("Should emit TicketCreated when a user buys a STANDARD ticket", async () => {
            // WHEN / THEN
            await expect(ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard))
                .to.emit(ticketing, "TicketCreated")
                .withArgs(2, 1, other.address, TicketType.STANDARD); // ticketId 2, eventId 1
        });

        it("Should not allow creating a ticket for a cancelled event", async () => {
            // GIVEN
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });

    describe('createTicketFor() tests suite', () => {
        it('Should organizer can create VIP ticket for a user', async () => {
            // WHEN / THEN
            await expect(ticketing.connect(owner).createTicketFor(1, other.address, TicketType.VIP, ticketURIVIP))
                .to.emit(ticketing, "TicketCreated")
                .withArgs(2, 1, other.address, TicketType.VIP);

            // THEN
            const ticket = await ticketing.tickets(2);
            expect(await ticketing.ownerOf(ticket.id)).to.equal(other.address);
            expect(ticket.ticketType).to.equal(TicketType.VIP);
            expect(await ticketing.tokenURI(ticket.id)).to.equal(ticketURIVIP);
        });

        it('Should non-organizer cannot create tickets for others', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(other).createTicketFor(1, owner.address, TicketType.VIP, ticketURIVIP)
            ).to.be.revertedWith("Only organizer can create tickets for others.");
        });

        it('Cannot create STANDARD ticket via createTicketFor', async () => {
            // WHEN / THEN
            await expect(
                ticketing.connect(owner).createTicketFor(1, other.address, TicketType.STANDARD, ticketURIStandard)
            ).to.be.revertedWith("Only VIP or STAFF tickets can be created for others.");
        });

        it("Should not allow organizer to create ticket for cancelled event", async () => {
            // GIVEN
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.createTicketFor(1, other.address, TicketType.VIP, ticketURIVIP)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });

    describe('updateTicketType() tests suite', () => {
        it("Should organizer can upgrade STANDARD ticket to VIP", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // WHEN
            await ticketing.updateTicketType(1, other.address, TicketType.VIP);

            // THEN
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);
            const ticket = await ticketing.tickets(ticketId);
            expect(ticket.ticketType).to.equal(TicketType.VIP);
        });

        it("Should organizer can downgrade VIP ticket to STANDARD", async () => {
            // GIVEN
            await ticketing.createTicketFor(1, other.address, TicketType.VIP, ticketURIVIP);

            // WHEN
            await ticketing.updateTicketType(1, other.address, TicketType.STANDARD);

            // THEN
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);
            const ticket = await ticketing.tickets(ticketId);
            expect(ticket.ticketType).to.equal(TicketType.STANDARD);
        });

        it("Should not allow setting newType to ORGANIZER", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // WHEN / THEN
            await expect(
                ticketing.updateTicketType(1, other.address, TicketType.ORGANIZER)
            ).to.be.revertedWith("Invalid ticket type.");
        });

        it("Should not allow non-organizer to update ticket type", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

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
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // WHEN / THEN
            await expect(
                ticketing.updateTicketType(1, other.address, TicketType.VIP)
            ).to.emit(ticketing, "TicketTypeUpdated")
            .withArgs(2, other.address, TicketType.STANDARD, TicketType.VIP);
        });

        it("Should revert when passing invalid ticket type (unknown)", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // WHEN / THEN
            await expect(
                ticketing.updateTicketType(1, other.address, TicketType.UNKNOWN)
            ).to.be.reverted;
        });

        it("Should not allow updating ticket type if event is cancelled", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
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
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);

            // WHEN / THEN
            await expect(ticketing.connect(other).resellTicket(1, buyer.address))
                .to.emit(ticketing, 'TicketResold')
                .withArgs(ticketId, 1, other.address, buyer.address);

            // THEN
            const ticket = await ticketing.tickets(ticketId);
            expect(await ticketing.ownerOf(ticket.id)).to.equal(buyer.address);
            expect(await ticketing.ticketIdByEventAndOwner(1, buyer.address)).to.equal(ticketId);
            expect(await ticketing.ticketIdByEventAndOwner(1, other.address)).to.equal(0);
        });

        it('Should not allow reselling VIP ticket', async () => {
            // GIVEN
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.VIP, ticketURIVIP);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).resellTicket(1, buyer.address)
            ).to.be.revertedWith("Only STANDARD tickets can be resold.");
        });

        it('Should not allow reselling STAFF ticket', async () => {
            // GIVEN
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.STAFF, ticketURIStaff);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).resellTicket(1, buyer.address)
            ).to.be.revertedWith("Only STANDARD tickets can be resold.");
        });

        it('Should not allow reselling to someone who already has a ticket', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
            await ticketing.connect(buyer).createTicket(1, TicketType.STANDARD, ticketURIStandard);

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
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // WHEN / THEN
            await expect(
                ticketing.connect(buyer).resellTicket(1, owner.address)
            ).to.be.revertedWith("You do not own a ticket for this event.");
        });

        it("Should not allow reselling a ticket if event is cancelled", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
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
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // WHEN
            await ticketing.connect(other).useTicket(2);
            const ticket = await ticketing.tickets(2);

            // THEN
            expect(ticket.used).to.equal(true);
            expect(await ticketing.ownerOf(ticket.id)).to.equal(other.address);
        });

        it('Should non owner cannot use someone else\'s ticket', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // WHEN / THEN
            await expect(
                ticketing.connect(owner).useTicket(2)
            ).to.be.revertedWith("Only the ticket owner can use the ticket.");
        });

        it("Should emit TicketUsed when a ticket is used", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
            
            // WHEN / THEN
            await expect(ticketing.connect(other).useTicket(2))
                .to.emit(ticketing, "TicketUsed")
                .withArgs(2, other.address);
        });

        it("Should not allow using a ticket if event is cancelled", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
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
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.VIP, ticketURIVIP);
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);

            // WHEN / THEN
            await expect(ticketing.connect(owner).removeTicket(1, other.address))
                .to.emit(ticketing, 'TicketRemoved')
                .withArgs(ticketId, 1, other.address, TicketType.VIP);

            // THEN
            await expect(ticketing.ownerOf(ticketId)).to.be.reverted;   // ticket supprimé
            expect(await ticketing.ticketIdByEventAndOwner(1, other.address)).to.equal(0);
        });

        it('Should allow organizer to remove STAFF ticket', async () => {
            // GIVEN
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.STAFF, ticketURIStaff);
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);

            // WHEN / THEN
            await expect(ticketing.connect(owner).removeTicket(1, other.address))
                .to.emit(ticketing, 'TicketRemoved')
                .withArgs(ticketId, 1, other.address, TicketType.STAFF);

            // THEN
            await expect(ticketing.ownerOf(ticketId)).to.be.reverted;   // ticket supprimé
            expect(await ticketing.ticketIdByEventAndOwner(1, other.address)).to.equal(0);
        });

        it('Should not allow removing STANDARD ticket', async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // WHEN / THEN
            await expect(
                ticketing.connect(owner).removeTicket(1, other.address)
            ).to.be.revertedWith("Only VIP or STAFF tickets can be removed by organizer.");
        });

        it('Should not allow non-organizer to remove a ticket', async () => {
            // GIVEN
            await ticketing.connect(owner).createTicketFor(1, other.address, TicketType.VIP, ticketURIVIP);

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
            await ticketing.createTicketFor(1, other.address, TicketType.VIP, ticketURIVIP);
            await ticketing.cancelEvent(1);

            // WHEN / THEN
            await expect(
                ticketing.removeTicket(1, other.address)
            ).to.be.revertedWith("Event is cancelled.");
        });
    });

    describe("NFT minting", () => {
        it("Should mint an NFT with correct tokenURI when a ticket is created", async () => {
            // GIVEN
            await ticketing.createEvent("My Event", futureDate, initialMetadata);

            // WHEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, "ipfs://standard-1.json");
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);

            // THEN
            expect(await ticketing.ownerOf(ticketId)).to.equal(other.address);
            expect(await ticketing.tokenURI(ticketId)).to.equal("ipfs://standard-1.json");

            // THEN : Vérification ticket ORGANIZER
            const organizerTicketId = await ticketing.ticketIdByEventAndOwner(1, owner.address);
            expect(await ticketing.tokenURI(organizerTicketId)).to.equal("organizer-1.json");
        });

        it("Should mint an NFT when a ticket is created", async () => {
            // GIVEN
            await ticketing.createEvent("My Event", futureDate, initialMetadata);

            // WHEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);

            // THEN
            expect(await ticketing.ownerOf(ticketId)).to.equal(other.address);
            expect(await ticketing.tokenURI(ticketId)).to.equal(ticketURIStandard);
        });

        it("Should use ticketId as tokenId", async () => {
            // GIVEN
            await ticketing.createEvent("My Event", futureDate, initialMetadata);

            // WHEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);
            const ticket = await ticketing.tickets(ticketId);

            // THEN
            expect(ticket.id).to.equal(ticketId);
            expect(await ticketing.ownerOf(ticketId)).to.equal(other.address);
            expect(await ticketing.tokenURI(ticketId)).to.equal(ticketURIStandard);
        });
    });

    describe("NFT transfers restrictions", () => {

        let receiver: any;

        beforeEach(async () => {
            [, , receiver] = await ethers.getSigners();
        });

        it("Should prevent direct ERC721 transfer", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, other.address);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).transferFrom(other.address, owner.address, ticketId)
            ).to.be.revertedWith("Direct NFT transfers are disabled.");
        });

        it("Should allow resale via resellTicket", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // WHEN
            await ticketing.connect(other).resellTicket(1, receiver.address);

            // THEN
            const ticketId = await ticketing.ticketIdByEventAndOwner(1, receiver.address);
            expect(await ticketing.ownerOf(ticketId)).to.equal(receiver.address);
        });

        it("Should prevent resale of VIP ticket", async () => {
            // GIVEN
            await ticketing.createTicketFor(1, other.address, TicketType.VIP, ticketURIVIP);

            // WHEN / THEN
            await expect(
                ticketing.connect(other).resellTicket(1, owner.address)
            ).to.be.revertedWith("Only STANDARD tickets can be resold.");
        });

        it("Should revert resale if recipient already has a ticket", async () => {
            // GIVEN
            await ticketing.connect(other).createTicket(1, TicketType.STANDARD, ticketURIStandard);

            // THEN
            await expect(
                ticketing.connect(other).resellTicket(1, owner.address)
            ).to.be.revertedWith("Recipient already has a ticket for this event.");
        });
    });
});
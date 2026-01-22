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

    it('Owner can use their ticket', async () => {
        const Ticketing = await ethers.getContractFactory('Ticketing');
        const ticketing = await Ticketing.deploy();

        const [owner] = await ethers.getSigners();

        // Créer un ticket
        await ticketing.createTicket();

        // Utiliser le ticket
        await ticketing.useTicket(1);

        // Vérifier que le ticket est marqué comme utilisé
        const ticket = await ticketing.tickets(1);

        expect(ticket.used).to.equal(true);
        expect(ticket.owner).to.equal(owner.address);
    });

    it('Non owner cannot use someone else\'s ticket', async () => {
        const Ticketing = await ethers.getContractFactory('Ticketing');
        const ticketing = await Ticketing.deploy();

        const [owner, nonOwner] = await ethers.getSigners();

        // Créer un ticket par le propriétaire
        await ticketing.createTicket();

        // Tenter d'utiliser le ticket par un non-propriétaire
        await expect(
            ticketing.connect(nonOwner).useTicket(1)
        ).to.be.revertedWith("Only the ticket owner can use the ticket.");
    });
});
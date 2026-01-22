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
    });

    it('Should store the event name', async () => {
        expect(await ticketing.getEventName()).to.equal("Ticketing Dapp");
    })

    it('Should create a ticket and assign it to the caller', async () => {
        // GIVEN
        await ticketing.createTicket();

        // WHEN
        const ticket = await ticketing.tickets(1);

        // THEN
        expect(ticket.id).to.equal(1);
        expect(ticket.owner).to.equal(owner.address);
    })

    it('Owner can use their ticket', async () => {
        // GIVEN
        await ticketing.createTicket();

        // WHEN
        await ticketing.useTicket(1);

        // THEN
        const ticket = await ticketing.tickets(1);
        expect(ticket.used).to.equal(true);
        expect(ticket.owner).to.equal(owner.address);
    });

    it('Non owner cannot use someone else\'s ticket', async () => {
        // GIVEN
        await ticketing.createTicket();

        // WHEN / THEN
        await expect(
            ticketing.connect(other).useTicket(1)
        ).to.be.revertedWith("Only the ticket owner can use the ticket.");
    });
});
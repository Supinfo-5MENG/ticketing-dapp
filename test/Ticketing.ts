import { expect } from 'chai';
import { ethers } from "hardhat";

describe('Ticketing contract', () => {

    it('Should store the event name', async () => {
        const Ticketing = await ethers.getContractFactory('Ticketing');
        const ticketing = await Ticketing.deploy();

        expect(await ticketing.getEventName()).to.equal("Ticketing Dapp");
    })
});
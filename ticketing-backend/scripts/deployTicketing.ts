const hre = require("hardhat");

async function main() {
    const Ticketing = await hre.ethers.getContractFactory("Ticketing");
    const ticketing = await Ticketing.deploy();

    await ticketing.waitForDeployment();

    const address = await ticketing.getAddress();
    console.log("✅ Ticketing déployé à l'adresse:", address);
    console.log("\n📋 Copie cette adresse dans ton frontend (src/config/web3.ts)");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
const hre = require("hardhat");

async function main() {
  console.log("Seeding markets to Base Mainnet...");

  const MARKET_ADDRESS = "0xa9c759946375903db964A8fbf812f9fdfE8648d7";
  
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const market = await PredictionMarket.attach(MARKET_ADDRESS);

  const duration = 24 * 60 * 60; // 24 hours

  console.log("Creating BTC Market...");
  let tx1 = await market.createMarket("Will BTC cross $70,000 in 24h?", duration);
  await tx1.wait();
  console.log("BTC Market created.");

  console.log("Creating ETH Market...");
  let tx2 = await market.createMarket("Will ETH cross $4,000 in 24h?", duration);
  await tx2.wait();
  console.log("ETH Market created.");

  console.log("Creating SOL Market...");
  let tx3 = await market.createMarket("Will SOL cross $200 in 24h?", duration);
  await tx3.wait();
  console.log("SOL Market created.");

  console.log("Seeding completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

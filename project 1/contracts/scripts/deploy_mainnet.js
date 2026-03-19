const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Base Mainnet...");

  const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // Deploy PredictionMarket with real USDC
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const market = await PredictionMarket.deploy(USDC_BASE_MAINNET);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();

  console.log("\nDeployment completed!");
  console.log("USDC_ADDRESS (Mainnet):", USDC_BASE_MAINNET);
  console.log("MARKET_ADDRESS (Mainnet):", marketAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

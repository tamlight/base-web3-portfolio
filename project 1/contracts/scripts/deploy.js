const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Base Sepolia...");

  // 1. Deploy MockUSDC
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // 2. Deploy PredictionMarket
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const market = await PredictionMarket.deploy(usdcAddress);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("PredictionMarket deployed to:", marketAddress);

  console.log("\nDeployment completed!");
  console.log("USDC_ADDRESS:", usdcAddress);
  console.log("MARKET_ADDRESS:", marketAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

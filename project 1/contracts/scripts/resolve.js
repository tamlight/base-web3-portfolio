const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const MARKET_ADDRESS = "0xe845F25FE17a1C38b33AA3830e66D81d6C3996E3"; // Your deployed Mainnet market address
  const outcome = true; // Set to true for YES, false for NO

  console.log(`Resolving market at ${MARKET_ADDRESS} with outcome: ${outcome ? "YES" : "NO"}...`);

  const PredictionMarket = await hre.ethers.getContractAt("PredictionMarket", MARKET_ADDRESS);
  
  const tx = await PredictionMarket.resolve(outcome);
  await tx.wait();

  console.log("Market successfully resolved!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

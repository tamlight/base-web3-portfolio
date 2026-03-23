const hre = require("hardhat");

async function main() {
  const BaseTip = await hre.ethers.getContractFactory("BaseTip");
  console.log("Deploying BaseTip...");
  const baseTip = await BaseTip.deploy();
  await baseTip.waitForDeployment();

  console.log("BaseTip deployed to:", await baseTip.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

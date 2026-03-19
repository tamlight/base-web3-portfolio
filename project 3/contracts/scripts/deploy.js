const hre = require("hardhat");

async function main() {
  console.log("Deploying BaseVote to Base Mainnet...");

  const BaseVote = await hre.ethers.getContractFactory("BaseVote");
  const vote = await BaseVote.deploy();
  await vote.waitForDeployment();
  const voteAddress = await vote.getAddress();

  console.log("\nDeployment completed!");
  console.log("VOTE_ADDRESS (Mainnet):", voteAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

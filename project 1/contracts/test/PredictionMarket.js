const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PredictionMarket", function () {
  let PredictionMarket, predictionMarket, MockUSDC, usdc;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarket.deploy(await usdc.getAddress());

    // Give some USDC to users
    await usdc.transfer(user1.address, 1000 * 10**6);
    await usdc.transfer(user2.address, 1000 * 10**6);
  });

  it("Should allow betting", async function () {
    const betAmount = 100 * 10**6;
    await usdc.connect(user1).approve(await predictionMarket.getAddress(), betAmount);
    await predictionMarket.connect(user1).bet(true, betAmount);

    const marketInfo = await predictionMarket.getMarketInfo();
    expect(marketInfo[0]).to.equal(betAmount); // totalYes
    expect(marketInfo[4]).to.equal(betAmount); // totalPot
  });

  it("Should calculate winnings correctly", async function () {
    const betAmount1 = 100 * 10**6; // user 1 bets 100 on Yes
    const betAmount2 = 50 * 10**6;  // user 2 bets 50 on No

    await usdc.connect(user1).approve(await predictionMarket.getAddress(), betAmount1);
    await predictionMarket.connect(user1).bet(true, betAmount1);

    await usdc.connect(user2).approve(await predictionMarket.getAddress(), betAmount2);
    await predictionMarket.connect(user2).bet(false, betAmount2);

    // Resolve as Yes
    await predictionMarket.resolve(true);

    const initialBalance = await usdc.balanceOf(user1.address);
    await predictionMarket.connect(user1).claim();
    const finalBalance = await usdc.balanceOf(user1.address);

    // User 1 should get the entire pot (150)
    expect(finalBalance - initialBalance).to.equal(150 * 10**6);
  });
});

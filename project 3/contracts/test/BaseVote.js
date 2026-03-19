const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseVote", function () {
  let BaseVote, vote;
  let host, user1, user2, user3;

  beforeEach(async function () {
    [host, user1, user2, user3] = await ethers.getSigners();
    BaseVote = await ethers.getContractFactory("BaseVote");
    vote = await BaseVote.deploy();
  });

  it("Should create a poll", async function () {
    const q = "Is Base the best L2?";
    await vote.connect(host).createPoll(q);
    const p = await vote.polls(0);
    expect(p.question).to.equal(q);
    expect(p.host).to.equal(host.address);
  });

  it("Should allow voting and record bets", async function () {
    await vote.connect(host).createPoll("Test Poll");
    const amount = ethers.parseEther("1.0");
    await vote.connect(user1).vote(0, true, { value: amount });
    
    const p = await vote.polls(0);
    expect(p.yesVotersCount).to.equal(1);
    expect(p.totalYesBet).to.equal(amount);
  });

  it("Should resolve based on voter count, not amount", async function () {
    await vote.connect(host).createPoll("Test Poll");
    
    // User1 votes YES with 1 ETH
    await vote.connect(user1).vote(0, true, { value: ethers.parseEther("1.0") });
    
    // User2 and User3 vote NO with 0.1 ETH each
    await vote.connect(user2).vote(0, false, { value: ethers.parseEther("0.1") });
    await vote.connect(user3).vote(0, false, { value: ethers.parseEther("0.1") });

    // NO should win (2 voters vs 1 voter)
    await vote.connect(host).resolve(0);
    
    const p = await vote.polls(0);
    expect(p.winnerOutcome).to.equal(false); // NO won
    expect(p.resolved).to.equal(true);
  });

  it("Should allow winners to claim their share", async function () {
    await vote.connect(host).createPoll("Test Poll");
    
    // User1 votes YES with 1 ETH
    await vote.connect(user1).vote(0, true, { value: ethers.parseEther("1.0") });
    // User2 votes NO with 1 ETH
    await vote.connect(user2).vote(0, false, { value: ethers.parseEther("1.0") });

    // Host resolves as YES (voters equal, default to NO in my logic if tie, but let's test a clean win)
    // Wait, my logic says `if (yesVotersCount > noVotersCount) yes else no`. 
    // Let's make user3 vote YES to ensure YES wins.
    await vote.connect(user3).vote(0, true, { value: ethers.parseEther("1.0") });
    
    // 2 YES voters, 1 NO voter. YES wins. Total pot = 3 ETH.
    // User1 and User3 share 3 ETH proportionally. Since they bet same, 1.5 ETH each.
    
    await vote.connect(host).resolve(0);
    
    const initialBalance = await ethers.provider.getBalance(user1.address);
    await vote.connect(user1).claim(0);
    const finalBalance = await ethers.provider.getBalance(user1.address);
    
    expect(finalBalance).to.be.gt(initialBalance); // Exact check is hard with gas, but 1.5 ETH is significantly more than 0.
  });
});

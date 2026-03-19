// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PredictionMarket {
    address public owner;
    IERC20 public immutable usdc;

    struct Market {
        uint256 totalYes;
        uint256 totalNo;
        bool resolved;
        bool outcome; // true = Yes, false = No
        uint256 totalPot;
    }

    Market public market;
    mapping(address => uint256) public betsYes;
    mapping(address => uint256) public betsNo;
    mapping(address => bool) public claimed;

    event BetPlaced(address indexed user, bool outcome, uint256 amount);
    event MarketResolved(bool outcome);
    event WinningsClaimed(address indexed user, uint256 amount);

    constructor(address _usdc) {
        owner = msg.sender;
        usdc = IERC20(_usdc);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function bet(bool _outcome, uint256 _amount) external {
        require(!market.resolved, "Market already resolved");
        require(_amount > 0, "Amount must be > 0");

        require(usdc.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");

        if (_outcome) {
            market.totalYes += _amount;
            betsYes[msg.sender] += _amount;
        } else {
            market.totalNo += _amount;
            betsNo[msg.sender] += _amount;
        }
        market.totalPot += _amount;

        emit BetPlaced(msg.sender, _outcome, _amount);
    }

    function resolve(bool _outcome) external onlyOwner {
        require(!market.resolved, "Already resolved");
        market.resolved = true;
        market.outcome = _outcome;
        emit MarketResolved(_outcome);
    }

    function claim() external {
        require(market.resolved, "Market not resolved");
        require(!claimed[msg.sender], "Already claimed");

        uint256 userBet;
        uint256 totalWinningBets;

        if (market.outcome) {
            userBet = betsYes[msg.sender];
            totalWinningBets = market.totalYes;
        } else {
            userBet = betsNo[msg.sender];
            totalWinningBets = market.totalNo;
        }

        require(userBet > 0, "No winning bets");
        
        // Calculate winnings: share of the total pot
        // Formula: (userBet / totalWinningBets) * totalPot
        uint256 winnings = (userBet * market.totalPot) / totalWinningBets;
        
        claimed[msg.sender] = true;
        require(usdc.transfer(msg.sender, winnings), "Transfer failed");

        emit WinningsClaimed(msg.sender, winnings);
    }

    function getMarketInfo() external view returns (uint256, uint256, bool, bool, uint256) {
        return (market.totalYes, market.totalNo, market.resolved, market.outcome, market.totalPot);
    }
}

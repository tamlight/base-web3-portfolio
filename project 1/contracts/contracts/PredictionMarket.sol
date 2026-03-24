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
        string question;
        uint256 endTime;
        uint256 totalYes;
        uint256 totalNo;
        bool resolved;
        bool outcome; // true = Yes, false = No
        uint256 totalPot;
    }

    uint256 public nextMarketId;
    mapping(uint256 => Market) public markets;
    
    // marketId => user => amount
    mapping(uint256 => mapping(address => uint256)) public betsYes;
    mapping(uint256 => mapping(address => uint256)) public betsNo;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event MarketCreated(uint256 indexed marketId, string question, uint256 endTime);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool outcome, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    constructor(address _usdc) {
        owner = msg.sender;
        usdc = IERC20(_usdc);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Admin creates a new market with a specific strictly enforced duration
    function createMarket(string memory _question, uint256 _durationSeconds) external onlyOwner {
        uint256 marketId = nextMarketId++;
        Market storage m = markets[marketId];
        m.question = _question;
        m.endTime = block.timestamp + _durationSeconds;
        
        emit MarketCreated(marketId, _question, m.endTime);
    }

    function bet(uint256 _marketId, bool _outcome, uint256 _amount) external {
        Market storage m = markets[_marketId];
        require(bytes(m.question).length > 0, "Market does not exist");
        require(!m.resolved, "Market already resolved");
        require(block.timestamp < m.endTime, "Betting phase has ended");
        require(_amount > 0, "Amount must be > 0");

        require(usdc.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");

        if (_outcome) {
            m.totalYes += _amount;
            betsYes[_marketId][msg.sender] += _amount;
        } else {
            m.totalNo += _amount;
            betsNo[_marketId][msg.sender] += _amount;
        }
        m.totalPot += _amount;

        emit BetPlaced(_marketId, msg.sender, _outcome, _amount);
    }

    // Admin dictates the final settlement outcome. Must wait for betting phase to end.
    function resolve(uint256 _marketId, bool _outcome) external onlyOwner {
        Market storage m = markets[_marketId];
        require(bytes(m.question).length > 0, "Market does not exist");
        require(!m.resolved, "Already resolved");
        require(block.timestamp >= m.endTime, "Betting phase still active");

        m.resolved = true;
        m.outcome = _outcome;
        emit MarketResolved(_marketId, _outcome);
    }

    function claim(uint256 _marketId) external {
        Market storage m = markets[_marketId];
        require(m.resolved, "Market not resolved");
        require(!claimed[_marketId][msg.sender], "Already claimed");

        uint256 userBet;
        uint256 totalWinningBets;

        if (m.outcome) {
            userBet = betsYes[_marketId][msg.sender];
            totalWinningBets = m.totalYes;
        } else {
            userBet = betsNo[_marketId][msg.sender];
            totalWinningBets = m.totalNo;
        }

        require(userBet > 0, "No winning bets");
        
        uint256 winnings = (userBet * m.totalPot) / totalWinningBets;
        
        claimed[_marketId][msg.sender] = true;
        require(usdc.transfer(msg.sender, winnings), "Transfer failed");

        emit WinningsClaimed(_marketId, msg.sender, winnings);
    }

    // Frontend helper
    function getMarketInfo(uint256 _marketId) external view returns (string memory, uint256, uint256, uint256, bool, bool, uint256) {
        Market storage m = markets[_marketId];
        return (m.question, m.endTime, m.totalYes, m.totalNo, m.resolved, m.outcome, m.totalPot);
    }
}

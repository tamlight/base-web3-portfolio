// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseVote {
    struct Poll {
        string question;
        uint256 yesVotersCount;
        uint256 noVotersCount;
        uint256 totalYesBet;
        uint256 totalNoBet;
        bool resolved;
        bool winnerOutcome; // true = Yes, false = No
        uint256 createdAt;
        address host;
    }

    uint256 public nextPollId;
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public userSide; // true = Yes, false = No
    mapping(uint256 => mapping(address => uint256)) public userBets;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event PollCreated(uint256 indexed pollId, string question, address host);
    event VotePlaced(uint256 indexed pollId, address indexed user, bool side, uint256 amount);
    event PollResolved(uint256 indexed pollId, bool winnerOutcome);
    event WinningsClaimed(uint256 indexed pollId, address indexed user, uint256 amount);

    function createPoll(string memory _question) external returns (uint256) {
        uint256 pollId = nextPollId++;
        polls[pollId] = Poll({
            question: _question,
            yesVotersCount: 0,
            noVotersCount: 0,
            totalYesBet: 0,
            totalNoBet: 0,
            resolved: false,
            winnerOutcome: false,
            createdAt: block.timestamp,
            host: msg.sender
        });

        emit PollCreated(pollId, _question, msg.sender);
        return pollId;
    }

    function vote(uint256 _pollId, bool _side) external payable {
        Poll storage poll = polls[_pollId];
        require(!poll.resolved, "Poll already resolved");
        require(!hasVoted[_pollId][msg.sender], "Already voted");
        require(msg.value > 0, "Must bet ETH to vote");

        hasVoted[_pollId][msg.sender] = true;
        userSide[_pollId][msg.sender] = _side;
        userBets[_pollId][msg.sender] = msg.value;

        if (_side) {
            poll.yesVotersCount++;
            poll.totalYesBet += msg.value;
        } else {
            poll.noVotersCount++;
            poll.totalNoBet += msg.value;
        }

        emit VotePlaced(_pollId, msg.sender, _side, msg.value);
    }

    function resolve(uint256 _pollId) external {
        Poll storage poll = polls[_pollId];
        require(msg.sender == poll.host, "Only host can resolve");
        require(!poll.resolved, "Already resolved");

        poll.resolved = true;
        
        // Winner is the side with more UNIQUE voters
        if (poll.yesVotersCount > poll.noVotersCount) {
            poll.winnerOutcome = true;
        } else {
            poll.winnerOutcome = false;
        }

        emit PollResolved(_pollId, poll.winnerOutcome);
    }

    function claim(uint256 _pollId) external {
        Poll storage poll = polls[_pollId];
        require(poll.resolved, "Poll not resolved");
        require(hasVoted[_pollId][msg.sender], "Did not vote");
        require(!claimed[_pollId][msg.sender], "Already claimed");
        require(userSide[_pollId][msg.sender] == poll.winnerOutcome, "Not a winner");

        uint256 userBet = userBets[_pollId][msg.sender];
        uint256 totalWinnerBets;
        uint256 totalPot = poll.totalYesBet + poll.totalNoBet;

        if (poll.winnerOutcome) {
            totalWinnerBets = poll.totalYesBet;
        } else {
            totalWinnerBets = poll.totalNoBet;
        }

        uint256 reward = (userBet * totalPot) / totalWinnerBets;
        
        claimed[_pollId][msg.sender] = true;
        payable(msg.sender).transfer(reward);

        emit WinningsClaimed(_pollId, msg.sender, reward);
    }

    function getPollInfo(uint256 _pollId) external view returns (string memory, uint256, uint256, uint256, uint256, bool, bool) {
        Poll storage p = polls[_pollId];
        return (p.question, p.yesVotersCount, p.noVotersCount, p.totalYesBet, p.totalNoBet, p.resolved, p.winnerOutcome);
    }
}

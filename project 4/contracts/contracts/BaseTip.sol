// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BaseTip {
    address payable public owner;

    event NewTip(
        address indexed from,
        address indexed to,
        string name,
        string message,
        uint256 amount,
        uint256 timestamp
    );

    struct Tip {
        address sender;
        address receiver;
        string name;
        string message;
        uint256 amount;
        uint256 timestamp;
    }

    Tip[] public tips;

    constructor() {
        owner = payable(msg.sender);
    }

    function sendTip(address payable _receiver, string memory _name, string memory _message) public payable {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(_receiver != address(0), "Invalid receiver address");

        // Forward ETH directly to the receiver dynamically
        (bool success, ) = _receiver.call{value: msg.value}("");
        require(success, "Failed to send ETH to receiver");

        tips.push(Tip(
            msg.sender,
            _receiver,
            _name,
            _message,
            msg.value,
            block.timestamp
        ));

        emit NewTip(msg.sender, _receiver, _name, _message, msg.value, block.timestamp);
    }

    function getTipsCount() public view returns (uint256) {
        return tips.length;
    }
    
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdraw failed");
    }
}

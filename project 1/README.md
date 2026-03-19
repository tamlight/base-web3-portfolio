# Base Predict - Binary Prediction Market

Simplest version of a prediction market on Base.

## Project Structure
- `contracts/`: Hardhat project for smart contract development.
- `app/`: Next.js application for the frontend.

## Getting Started

### Prerequisites
- Node.js & npm
- A wallet (Metamask, Coinbase Wallet, etc.)

### Installation
In both `contracts` and `app` folders, run:
```bash
npm install
```

### Smart Contract
To test:
```bash
cd contracts
npx hardhat test
```

### Frontend
To run locally:
```bash
cd app
npm run dev
```

## Manual Resolution
In v1, the contract owner must call the `resolve(bool outcome)` function on the contract once the event is concluded. After resolution, users can call `claim()` to get their winnings.

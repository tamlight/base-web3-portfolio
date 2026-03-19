# Base Web3 Projects Portfolio

A collection of decentralized applications (dApps) built on the **Base** network.

## Projects Overview

### 1. Prediction Market (Project 1) 📈
- **Description**: A binary prediction market where users bet on "YES" or "NO" outcomes.
- **Contract**: [0xe845F25FE17a1C38b33AA3830e66D81d6C3996E3](https://basescan.org/address/0xe845F25FE17a1C38b33AA3830e66D81d6C3996E3)
- **Frontend**: [LIVE on Vercel](https://app-one-beige-78.vercel.app)
- **Tech Stack**: Next.js, Wagmi, ConnectKit, Hardhat.

### 2. Escrow Service (Project 2) 🔒
- **Description**: A decentralized escrow platform for secure buyer-seller transactions.
- **Contract**: [0xD1da1A78e0645722deA52B3a58779045f310c8dE](https://basescan.org/address/0xD1da1A78e0645722deA52B3a58779045f310c8dE)
- **Frontend**: [LIVE on Vercel](https://frontend-six-omega-61.vercel.app)
- **Tech Stack**: Vanilla HTML/JS, Ethers.js, Hardhat.

### 3. Voting & Betting System (Project 3) 🗳️
- **Description**: A poll-based betting system where the side with more unique voters wins the pot.
- **Contract**: [0xa82D6cF2C339105725B9466e2DCDc9FA7FEd2f8A](https://basescan.org/address/0xa82D6cF2C339105725B9466e2DCDc9FA7FEd2f8A)
- **Frontend**: [LIVE on Vercel](https://frontend-six-omega-61.vercel.app) (Shared frontend)
- **Tech Stack**: Vanilla HTML/JS, Ethers.js, Hardhat.

## Development Environment

- **Network**: Base Mainnet
- **Solidity**: 0.8.24
- **EVM Version**: Paris (for compatibility)

## Deployment Instructions

### Smart Contracts
1. Navigate to the project's `contracts` folder.
2. Run `npm install`.
3. Configure `.env` with `PRIVATE_KEY`.
4. Run `npx hardhat run scripts/deploy.js --network base`.

### Frontend
- **Project 1**: Run `npm run dev` or deploy to Vercel/Netlify.
- **Project 2 & 3**: Open `index.html` directly or host as static files.

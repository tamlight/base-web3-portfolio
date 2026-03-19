'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { parseUnits, formatUnits } from 'viem';

// Simplified ABI for PredictionMarket
const ABI = [
  {"inputs":[{"internalType":"bool","name":"_outcome","type":"bool"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"bet","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getMarketInfo","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"market","outputs":[{"internalType":"uint256","name":"totalYes","type":"uint256"},{"internalType":"uint256","name":"totalNo","type":"uint256"},{"internalType":"bool","name":"resolved","type":"bool"},{"internalType":"bool","name":"outcome","type":"bool"},{"internalType":"uint256","name":"totalPot","type":"uint256"}],"stateMutability":"view","type":"function"}
];

// Simplified ABI for USDC (approve)
const USDC_ABI = [
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
];

const CONTRACT_ADDRESS = "0xe845F25FE17a1C38b33AA3830e66D81d6C3996E3";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export default function Home() {
  const { isConnected, address } = useAccount();
  const [amount, setAmount] = useState('10');
  const [outcome, setOutcome] = useState(true); // true = Yes, false = No

  const { data: marketData, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getMarketInfo',
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleBet = async () => {
    const betAmount = parseUnits(amount, 6);
    // 1. Approve USDC (In real app, check allowance first)
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, betAmount],
    });
    // Wait for approval then bet... (Simplifying for v1)
    // In v1, the user will have to click approve, then bet.
  };

  const executeBet = () => {
    const betAmount = parseUnits(amount, 6);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'bet',
      args: [outcome, betAmount],
    });
  };

  const handleClaim = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'claim',
    });
  };

  const [totalYes, totalNo, resolved, finalOutcome, totalPot] = marketData || [0n, 0n, false, false, 0n];

  return (
    <main className="container">
      <header>
        <h1>Base Predict</h1>
        <ConnectKitButton />
      </header>

      <section className="market-card">
        <h2>Will ETH hit $5,000 in 2026?</h2>
        <div className="stats">
          <div className="stat">
            <span className="label">Yes</span>
            <span className="value">{formatUnits(totalYes, 6)} USDC</span>
          </div>
          <div className="stat">
            <span className="label">No</span>
            <span className="value">{formatUnits(totalNo, 6)} USDC</span>
          </div>
        </div>

        {resolved ? (
          <div className="resolution">
            <h3>Market Resolved: {finalOutcome ? 'YES' : 'NO'}</h3>
            <button onClick={handleClaim} className="primary-btn">Claim Winnings</button>
          </div>
        ) : (
          <div className="betting-controls">
            <div className="input-group">
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (USDC)"
              />
            </div>
            <div className="button-group">
              <button 
                onClick={() => { setOutcome(true); executeBet(); }} 
                className="yes-btn"
              >
                Bet Yes
              </button>
              <button 
                onClick={() => { setOutcome(false); executeBet(); }} 
                className="no-btn"
              >
                Bet No
              </button>
            </div>
            <p className="hint">Note: You must approve USDC before betting.</p>
            <button onClick={handleBet} className="secondary-btn">Approve USDC</button>
          </div>
        )}
      </section>

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          font-family: var(--font-geist-sans);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .market-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        h1 { font-weight: 800; color: #fff; }
        h2 { font-size: 1.5rem; margin-bottom: 2rem; color: #fff; }
        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .label { font-size: 0.8rem; color: #aaa; text-transform: uppercase; }
        .value { font-size: 1.2rem; font-weight: 600; color: #fff; }
        .betting-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        input {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: #fff;
          font-size: 1rem;
        }
        .button-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        button {
          padding: 1rem;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .yes-btn { background: #22c55e; color: #fff; }
        .no-btn { background: #ef4444; color: #fff; }
        .primary-btn { background: #3b82f6; color: #fff; width: 100%; }
        .secondary-btn { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }
        button:hover { opacity: 0.8; transform: translateY(-2px); }
        .hint { font-size: 0.8rem; color: #777; text-align: center; }
      `}</style>
    </main>
  );
}

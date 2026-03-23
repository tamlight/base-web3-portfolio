'use client';

import { useState, useEffect } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useReadContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ConnectKitButton } from 'connectkit';
import { Coffee, Send, MessageSquare, TrendingUp, Heart, Trophy, Clock, User, Sun, Moon } from 'lucide-react';

const CONTRACT_ADDRESS = "0x07AF984cF9883E61f4d59C30938c030C94aa11D2";
const ABI = [
  {"name": "sendTip", "type": "function", "stateMutability": "payable", "inputs": [{"type": "address", "name": "_receiver"}, {"type": "string", "name": "_name"}, {"type": "string", "name": "_message"}], "outputs": []},
  {"name": "tips", "type": "function", "stateMutability": "view", "inputs": [{"type": "uint256"}], "outputs": [{"type": "address", "name": "sender"}, {"type": "address", "name": "receiver"}, {"type": "string", "name": "name"}, {"type": "string", "name": "message"}, {"type": "uint256", "name": "amount"}, {"type": "uint256", "name": "timestamp"}]},
  {"name": "getTipsCount", "type": "function", "stateMutability": "view", "inputs": [], "outputs": [{"type": "uint256"}]}
];

export default function Home() {
  const { isConnected } = useAccount();
  const [receiver, setReceiver] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('0.001');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const { data: tipsCount, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getTipsCount',
  });

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setName('');
      setMessage('');
      setReceiver('');
    }
  }, [isSuccess, refetch]);

  const handleSend = async () => {
    if (!receiver || !name || !message || !amount) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'sendTip',
      args: [receiver, name, message],
      value: parseEther(amount)
    });
  };

  return (
    <div className={`min-h-screen pb-20 selection:bg-indigo-100 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <nav className="glass-card sticky top-6 mx-auto max-w-5xl rounded-[32px] z-50 py-4 px-8 flex justify-between items-center mt-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-xl">
            <Coffee className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">BASE<span className="text-indigo-500">TIP</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl transition-all hover:scale-105"
          >
           {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>
          <ConnectKitButton />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 md:px-8 pt-16 grid grid-cols-12 gap-10">
        {/* Left: Input & Hero */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tighter">
              Support <span className="text-indigo-500">Anyone</span> on Base.
            </h1>
            <p className="text-lg opacity-70 leading-relaxed font-medium">
              The simplest way to support any creator or friend on the Base network. Enter their address, send a tip, and leave a message.
            </p>
          </div>

          <div className="glass-card p-8 md:p-10 rounded-[40px] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Receiver Address</label>
                <input 
                  placeholder="0x..." 
                  className="w-full bg-[var(--input-bg)] text-[var(--card-text)] border border-[var(--glass-border)] rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none font-mono"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Your Name</label>
                  <input 
                    placeholder="Satoshi" 
                    className="w-full bg-[var(--input-bg)] text-[var(--card-text)] border border-[var(--glass-border)] rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">ETH</label>
                  <input 
                    type="number"
                    step="0.001"
                    className="w-full bg-[var(--input-bg)] text-indigo-500 border border-[var(--glass-border)] rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none font-bold"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Message</label>
                <textarea 
                  placeholder="Leave a friendly message..." 
                  rows={3}
                  className="w-full bg-[var(--input-bg)] text-[var(--card-text)] border border-[var(--glass-border)] rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleSend}
              disabled={isConfirming || !isConnected}
              className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all hover:bg-indigo-600 active:scale-95 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 z-10 relative"
            >
              {isConfirming ? 'Confirming...' : (
                <>
                  Send Tip <Send className="w-5 h-5" />
                </>
              )}
            </button>
            
            {!isConnected && <p className="text-center text-xs opacity-50 font-medium">Connect wallet to send love</p>}
            {writeError && <p className="text-center text-[10px] text-red-500 font-bold uppercase tracking-widest">{writeError.shortMessage || 'Failed'}</p>}
          </div>
        </div>

        {/* Right: Wall of Fame */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Heart className="text-red-400 fill-red-400" /> Wall of Fame
              </h3>
              <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-500 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase">
                <TrendingUp className="w-4 h-4" /> Live
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {tipsCount && [...Array(Math.min(Number(tipsCount), 15))].map((_, i) => (
                <TipCard key={i} id={Number(tipsCount) - 1 - i} contractAddress={CONTRACT_ADDRESS} />
              ))}
              {Number(tipsCount) === 0 && (
                <div className="glass-card p-20 rounded-[40px] text-center space-y-4 border-dashed border-2 opacity-60">
                   <MessageSquare className="w-12 h-12 mx-auto" />
                   <p className="font-black tracking-widest uppercase text-xs">No tips yet • Be the first!</p>
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}

function TipCard({ id, contractAddress }) {
  const { data: tip } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'tips',
    args: [BigInt(id)],
  });

  if (!tip) return null;

  const [sender, receiver, name, message, amount, timestamp] = tip;

  return (
    <div className="glass-card p-8 rounded-[32px] hover:scale-[1.02] transition-all group flex flex-col sm:flex-row gap-6 items-start relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
      
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shrink-0 z-10">
        <Coffee className="w-6 h-6" />
      </div>
      <div className="flex-1 space-y-2 w-full z-10">
        <div className="flex justify-between items-start">
          <div>
             <h4 className="font-black text-lg tracking-tight leading-none mb-2">{name}</h4>
             <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold opacity-60">
               <span className="bg-[var(--input-bg)] px-2 py-0.5 rounded border border-[var(--glass-border)] font-mono">{sender.slice(0,6)}...{sender.slice(-4)}</span>
               <span>→</span>
               <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded font-mono border border-indigo-500/20">{receiver.slice(0,6)}...{receiver.slice(-4)}</span>
               <span>•</span>
               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(Number(timestamp) * 1000).toLocaleDateString()}</span>
             </div>
          </div>
          <span className="text-[14px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-lg">
            {formatEther(amount)} ETH
          </span>
        </div>
        <p className="text-sm leading-relaxed italic opacity-80 bg-[var(--input-bg)] p-3 rounded-xl border border-[var(--glass-border)] mt-2">"{message}"</p>
      </div>
    </div>
  );
}

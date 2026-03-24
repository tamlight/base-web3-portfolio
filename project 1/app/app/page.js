'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { parseUnits, formatUnits } from 'viem';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, CheckCircle2, Plus, BarChart2, Check, X, Award, Flame, Sun, Moon } from 'lucide-react';

const CONTRACT_ADDRESS = "0xa9c759946375903db964A8fbf812f9fdfE8648d7";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const ABI = [
  {"name": "owner", "type": "function", "stateMutability": "view", "inputs": [], "outputs": [{"type": "address"}]},
  {"name": "nextMarketId", "type": "function", "stateMutability": "view", "inputs": [], "outputs": [{"type": "uint256"}]},
  {"name": "createMarket", "type": "function", "stateMutability": "nonpayable", "inputs": [{"type": "string", "name": "_question"}, {"type": "uint256", "name": "_durationSeconds"}], "outputs": []},
  {"name": "bet", "type": "function", "stateMutability": "nonpayable", "inputs": [{"type": "uint256", "name": "_marketId"}, {"type": "bool", "name": "_outcome"}, {"type": "uint256", "name": "_amount"}], "outputs": []},
  {"name": "resolve", "type": "function", "stateMutability": "nonpayable", "inputs": [{"type": "uint256", "name": "_marketId"}, {"type": "bool", "name": "_outcome"}], "outputs": []},
  {"name": "claim", "type": "function", "stateMutability": "nonpayable", "inputs": [{"type": "uint256", "name": "_marketId"}], "outputs": []},
  {"name": "getMarketInfo", "type": "function", "stateMutability": "view", "inputs": [{"type": "uint256", "name": "_marketId"}], "outputs": [{"type": "string", "name": "question"}, {"type": "uint256", "name": "endTime"}, {"type": "uint256", "name": "totalYes"}, {"type": "uint256", "name": "totalNo"}, {"type": "bool", "name": "resolved"}, {"type": "bool", "name": "outcome"}, {"type": "uint256", "name": "totalPot"}]}
];

const USDC_ABI = [
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
];

function CryptoChart({ symbol, darkMode }) {
  const [data, setData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    const fetchBinance = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1h&limit=24`);
        const json = await res.json();
        const formatted = json.map(d => ({
          time: new Date(d[0]).getHours() + ':00',
          price: parseFloat(d[4])
        }));
        setData(formatted);
        setCurrentPrice(formatted[formatted.length - 1].price);
      } catch (e) { console.error(e); }
    };
    fetchBinance();
    const interval = setInterval(fetchBinance, 60000);
    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className={`mt-6 p-4 rounded-2xl ${darkMode ? 'bg-black/30' : 'bg-slate-50'} border ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <BarChart2 className="w-4 h-4" /> {symbol}/USDT Oracle
        </h4>
        <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>${currentPrice.toLocaleString()}</span>
      </div>
      <div className="w-full h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', color: darkMode ? '#fff' : '#000', fontSize: '10px' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [darkMode, setDarkMode] = useState(true);
  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState('86400');

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'owner',
  });

  const { data: nextMarketId, refetch: refetchId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'nextMarketId',
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isOwner = isConnected && address && owner && address.toLowerCase() === owner.toLowerCase();

  useEffect(() => {
    if (isSuccess) {
      refetchId();
      setQuestion('');
    }
  }, [isSuccess, refetchId]);

  const handleCreateMarket = () => {
    if (!question || !duration) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'createMarket',
      args: [question, BigInt(duration)],
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#030014] text-slate-200' : 'bg-slate-50 text-slate-900'} selection:bg-indigo-500/30`}>
      <nav className={`border-b transition-colors ${darkMode ? 'border-indigo-500/20 bg-black/40' : 'border-indigo-100 bg-white/80'} backdrop-blur-md sticky top-0 z-50 py-4 px-8 flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <Target className="text-indigo-500 w-8 h-8" />
          <span className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>BASE<span className="text-indigo-500">PREDICT</span> V2</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-all ${darkMode ? 'border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-400' : 'border-indigo-200 hover:bg-indigo-50 text-indigo-600'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <ConnectKitButton />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-12 gap-8">
        
        {/* Left Column: Docs & Charts */}
        <div className="col-span-12 lg:col-span-4 space-y-6 flex flex-col">
          
          <div className={`p-8 rounded-[32px] border transition-all relative overflow-hidden shadow-2xl ${darkMode ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20' : 'bg-white border-indigo-100'}`}>
            <h1 className={`text-3xl font-black leading-none mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>V2 PREDICTIONS</h1>
            <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bet USDC securely on multiple real-world events. Track crypto prices dynamically via Binance oracle.</p>
            <div className="flex gap-4">
              <div className="bg-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2 border border-emerald-500/20 tracking-widest uppercase">
                <Flame className="w-4 h-4" /> USDC LIVE
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[32px] border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Settlement Docs</h3>
            <div className={`space-y-4 text-sm font-medium leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <p><strong className={darkMode ? 'text-white' : 'text-slate-900'}>1. Countdown:</strong> Each market enforces a strict end time. Betting is auto-locked immediately at 00:00:00.</p>
              <p><strong className={darkMode ? 'text-white' : 'text-slate-900'}>2. Truth Settlement:</strong> Once locked, the Admin officially resolves the outcome based on Oracle pricing or verifiable truth.</p>
              <p><strong className={darkMode ? 'text-white' : 'text-slate-900'}>3. Claiming:</strong> Winners instantly claim proportional winnings directly from the USDC pool.</p>
            </div>
          </div>

          {/* Admin Create Market */}
          {isOwner && (
            <div className={`p-8 rounded-[32px] border ${darkMode ? 'bg-indigo-900/30 border-indigo-800' : 'bg-indigo-50 border-indigo-200 shadow-lg'}`}>
              <h3 className={`text-sm font-black mb-4 tracking-widest uppercase flex items-center gap-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                <Plus className="w-4 h-4" /> Admin Controls
              </h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Will SOL hit $200?" 
                  className={`w-full text-sm p-3 rounded-xl outline-none focus:ring-2 border ${darkMode ? 'bg-black/50 border-slate-700 focus:ring-indigo-500' : 'bg-white border-slate-300 focus:ring-indigo-400'}`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <select 
                  className={`w-full text-sm p-3 rounded-xl outline-none border focus:ring-2 ${darkMode ? 'bg-black/50 border-slate-700 focus:ring-indigo-500 text-slate-400' : 'bg-white border-slate-300 focus:ring-indigo-400 text-slate-600'}`}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="3600">1 Hour Duration</option>
                  <option value="86400">24 Hours Duration</option>
                  <option value="604800">7 Days Duration</option>
                </select>
                <button 
                  onClick={handleCreateMarket}
                  disabled={isConfirming}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition-all shadow shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 text-xs tracking-widest"
                >
                  {isConfirming ? 'DEPLOYING...' : 'CREATE MARKET'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Active Markets */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className={`text-2xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <TrendingUp className="text-indigo-500 w-6 h-6" /> Live Markets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
            {nextMarketId && Number(nextMarketId) > 0 ? (
              [...Array(Number(nextMarketId))].map((_, i) => (
                <MarketCard key={i} id={Number(nextMarketId) - 1 - i} isOwner={isOwner} darkMode={darkMode} />
              ))
            ) : (
              <div className={`col-span-2 p-16 rounded-[40px] border-2 border-dashed text-center opacity-60 ${darkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                <Target className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p className="font-bold uppercase tracking-widest text-xs">No active markets heavily deployed.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponent: Market Card
function MarketCard({ id, isOwner, darkMode }) {
  const [betAmount, setBetAmount] = useState('');
  const [now, setNow] = useState(Date.now());
  const [status, setStatus] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: market, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getMarketInfo',
    args: [BigInt(id)],
  });

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isProcessing, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setBetAmount('');
      setStatus('Tx Confirmed!');
      setTimeout(() => setStatus(''), 3000);
    }
  }, [isSuccess, refetch]);

  if (!market) return null;

  const [question, endTimeStr, totalYesRaw, totalNoRaw, resolved, outcome, totalPotRaw] = market;
  
  const endTime = Number(endTimeStr) * 1000;
  const isEnded = now >= endTime;
  
  // Countdown math
  const diffSecs = Math.max(0, Math.floor((endTime - now) / 1000));
  const h = Math.floor(diffSecs / 3600).toString().padStart(2, '0');
  const m = Math.floor((diffSecs % 3600) / 60).toString().padStart(2, '0');
  const s = (diffSecs % 60).toString().padStart(2, '0');

  const totalYes = Number(formatUnits(totalYesRaw, 6));
  const totalNo = Number(formatUnits(totalNoRaw, 6));
  const totalPot = Number(formatUnits(totalPotRaw, 6));

  const total = totalYes + totalNo > 0 ? (totalYes + totalNo) : 1;
  const yesProgress = (totalYes / total) * 100;
  const noProgress = (totalNo / total) * 100;

  let ticker = null;
  if (question.includes("BTC")) ticker = "BTC";
  else if (question.includes("ETH")) ticker = "ETH";
  else if (question.includes("SOL")) ticker = "SOL";

  const executeBet = (isYes) => {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'bet',
        args: [BigInt(id), isYes, parseUnits(betAmount, 6)],
      });
  };

  return (
    <div className={`border rounded-[32px] p-6 hover:border-indigo-500/30 transition-all shadow-lg flex flex-col justify-between h-full relative overflow-hidden ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
      
      {/* Live / Ended Badge */}
      <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-[9px] font-black tracking-[0.2em] border-l border-b flex items-center ${darkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
        {!resolved ? (isEnded ? 'AWAITING' : `LIVE - ${h}:${m}:${s}`) : 'SETTLED'}
      </div>

      <div className="flex-1">
        <h3 className={`text-xl font-bold mb-4 pr-12 leading-snug mt-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{question}</h3>

        {/* Dynamic Crypto Chart if applicable */}
        {ticker && !resolved && <CryptoChart symbol={ticker} darkMode={darkMode} />}

        <div className="flex items-center justify-between gap-4 mt-6 mb-4">
           <div className="bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest flex items-center justify-center">
              {totalPot.toFixed(2)} USDC
           </div>
           {status && <span className="text-[10px] text-emerald-500 font-bold animate-pulse">{status}</span>}
           {writeError && <span className="text-[9px] text-red-500 font-bold max-w-[120px] truncate">{writeError.shortMessage}</span>}
        </div>

        <div className="space-y-4 mb-6">
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex flex-row-reverse shadow-inner p-0.5 border border-white/5">
            <div className="h-full bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-1000" style={{ width: `${noProgress}%` }} />
            <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000 mr-auto" style={{ width: `${yesProgress}%` }} />
          </div>
          <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1 text-emerald-500"><Check className="w-3 h-3" /> YES (${totalYes.toFixed(2)})</span>
            <span className="flex items-center gap-1 text-red-500">NO (${totalNo.toFixed(2)}) <X className="w-3 h-3" /></span>
          </div>
        </div>
      </div>

      {!resolved ? (
        <div className={`p-4 rounded-xl border border-slate-800/50 mt-auto ${darkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
          <div className="flex flex-col gap-2">
            <input 
              type="number" 
              placeholder="Amount USDC" 
              disabled={isEnded}
              className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-sm ${isEnded ? 'opacity-50' : ''} ${darkMode ? 'bg-black/40 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => { writeContract({ address: USDC_ADDRESS, abi: USDC_ABI, functionName: 'approve', args: [CONTRACT_ADDRESS, parseUnits(betAmount||'1000', 6)] }); setStatus('Approving...'); }}
                disabled={isEnded || isProcessing}
                className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 font-bold py-2 rounded-lg transition-all text-[9px] tracking-widest border border-indigo-500/30 disabled:opacity-50"
              >
                1. APPROVE
              </button>
              <button 
                 onClick={() => executeBet(true)}
                 disabled={isEnded || isProcessing}
                 className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 rounded-lg transition-all text-[9px] tracking-widest shadow-lg disabled:opacity-50"
              >
                2. VOTE YES
              </button>
              <button 
                 onClick={() => executeBet(false)}
                 disabled={isEnded || isProcessing}
                 className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-2 rounded-lg transition-all text-[9px] tracking-widest shadow-lg disabled:opacity-50"
              >
                2. VOTE NO
              </button>
            </div>
          </div>
          
          {isEnded && isOwner && (
            <div className="mt-3 flex gap-2 pt-3 border-t border-indigo-500/20">
               <button onClick={() => writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'resolve', args: [BigInt(id), true] })} className="flex-1 border border-emerald-500 text-emerald-500 py-1.5 rounded-lg text-[9px] font-black tracking-widest hover:bg-emerald-500/10">RES YES</button>
               <button onClick={() => writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'resolve', args: [BigInt(id), false] })} className="flex-1 border border-red-500 text-red-500 py-1.5 rounded-lg text-[9px] font-black tracking-widest hover:bg-red-500/10">RES NO</button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-xl text-center shadow-xl relative overflow-hidden mt-auto">
          <Award className="w-8 h-8 text-yellow-400 mx-auto animate-bounce relative z-10 mb-2" />
          <div className="relative z-10 mb-4">
            <span className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.2em] block">Verified</span>
            <span className="text-2xl font-black text-white">{outcome ? 'YES WON' : 'NO WON'}</span>
          </div>
          <button onClick={() => writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'claim', args: [BigInt(id)] })} className="w-full bg-white text-indigo-600 font-black py-2 rounded-lg text-xs shadow-xl relative z-10 transition-transform active:scale-95">CLAIM</button>
        </div>
      )}
    </div>
  );
}

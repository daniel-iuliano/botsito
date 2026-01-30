
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Square, 
  Settings, 
  Activity, 
  History, 
  Zap, 
  Globe,
  Wifi,
  WifiOff,
  AlertOctagon,
  Lock,
  UserCheck
} from 'lucide-react';
import axios from 'axios';
import { BotStatus, TradingMode, TradingConfig, BotState, ConnectionStatus, MarketOpportunity, Trade, LogEntry } from './types';
import Dashboard from './components/Dashboard';
import ConfigPanel from './components/ConfigPanel';
import TradeHistory from './components/TradeHistory';
import LogConsole from './components/LogConsole';
import MarketScanner from './components/MarketScanner';
import RiskWarningModal from './components/RiskWarningModal';
import ConnectionPanel from './components/ConnectionPanel';
import { scoreMarket } from './scoringEngine';
import { calculateRSI } from './indicators';

// Backend URL constant
const API_BASE_URL = 'http://localhost:4000/api';

const INITIAL_CONFIG: TradingConfig = {
  mode: TradingMode.SIMULATION,
  maxBalanceUsagePercent: 30,
  maxRiskPerTradePercent: 1.5,
  takeProfitPercent: 1.2,
  stopLossPercent: 0.8,
  trailingStopEnabled: true,
  cooldownSeconds: 60,
  maxOpenPositions: 3,
  minVolumeUSD: 500000,
  minOpportunityScore: 75,
  rsiOversold: 30,
  rsiOverbought: 70,
};

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'CET/USDT', 'XRP/USDT', 'ADA/USDT', 'AVAX/USDT', 'DOT/USDT', 'LINK/USDT', 'DOGE/USDT'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'config' | 'history'>('dashboard');
  const [showWarning, setShowWarning] = useState(false);
  
  const [credentials, setCredentials] = useState<{key: string, secret: string} | null>(null);

  const [state, setState] = useState<BotState>({
    status: BotStatus.OFF,
    connection: ConnectionStatus.UNAUTHENTICATED,
    config: INITIAL_CONFIG,
    opportunities: [],
    trades: [],
    logs: [],
    balance: 25000,
    equity: [25000],
  });

  const engineStateRef = useRef<BotState>(state);
  useEffect(() => { engineStateRef.current = state; }, [state]);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    setState(prev => ({
      ...prev,
      logs: [{ timestamp: Date.now(), level, message }, ...prev.logs].slice(0, 100)
    }));
  }, []);

  const handleConnect = async (key: string, secret: string) => {
    setState(prev => ({ ...prev, connection: ConnectionStatus.CONNECTING }));
    addLog(`Initiating HMAC-SHA256 handshake...`, "INFO");
    
    try {
      const response = await axios.post(`${API_BASE_URL}/set-api-keys`, { apiKey: key, apiSecret: secret });
      
      if (response.data.success) {
        setCredentials({ key, secret });
        setState(prev => ({ 
          ...prev, 
          connection: ConnectionStatus.CONNECTED,
          accountName: response.data.username
        }));
        addLog(`Authenticated as ${response.data.username}.`, "INFO");
      } else {
        throw new Error(response.data.message || "Auth failed");
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, connection: ConnectionStatus.AUTH_FAILED }));
      addLog(`Authentication failed: ${error.message}`, "ERROR");
    }
  };

  // Main Loop with Scoring Engine Integration
  useEffect(() => {
    if (state.status !== BotStatus.RUNNING) return;

    const interval = setInterval(() => {
      // Evaluation Loop
      const newOpportunities: MarketOpportunity[] = SYMBOLS.map(sym => {
        const volatility = Math.random() * 5;
        const currentPrice = (sym === 'BTC/USDT' ? 68000 : sym === 'ETH/USDT' ? 3500 : 100) * (1 + (Math.random() - 0.5) * 0.01);
        
        // Use realistic RSI simulation or calculation
        const rsi = 25 + Math.random() * 50;
        const spreadValue = currentPrice * (0.0001 + Math.random() * 0.0005);
        const volume = 500000 + Math.random() * 2000000;

        const score = scoreMarket({
          symbol: sym,
          price: currentPrice,
          volume: volume,
          spread: spreadValue,
          rsi: rsi,
          volumeSpike: Math.random() > 0.8,
          maxSpread: 0.1 // 0.1% max spread threshold
        });
        
        return {
          symbol: sym,
          score,
          price: currentPrice,
          change24h: (Math.random() - 0.4) * 8,
          volume24h: volume / 1000000,
          spread: (spreadValue / currentPrice) * 100,
          indicators: {
            rsi,
            macd: { value: 0, signal: 0, histogram: 0 },
            ema3: currentPrice,
            ema9: currentPrice,
            ema21: currentPrice,
            volatility
          },
          reason: rsi < 30 ? "Deep Oversold RSI" : "Momentum Score"
        };
      }).sort((a, b) => b.score - a.score);

      // Execution logic
      const openTrades = engineStateRef.current.trades.filter(t => t.status === 'OPEN');
      if (openTrades.length < state.config.maxOpenPositions) {
        const bestOpp = newOpportunities[0];
        const alreadyTrading = openTrades.some(t => t.symbol === bestOpp.symbol);
        
        if (bestOpp.score >= state.config.minOpportunityScore && !alreadyTrading) {
          const riskAmount = (engineStateRef.current.balance * (state.config.maxRiskPerTradePercent / 100));
          const qty = riskAmount / bestOpp.price;
          
          const newTrade: Trade = {
            id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            symbol: bestOpp.symbol,
            type: 'BUY',
            entryPrice: bestOpp.price,
            quantity: qty,
            status: 'OPEN',
            pnl: 0,
            pnlPercent: 0,
            entryTime: Date.now(),
            isSimulated: state.config.mode === TradingMode.SIMULATION,
          };
          
          setState(prev => ({ ...prev, trades: [newTrade, ...prev.trades] }));
          addLog(`SCALPER: Entering ${newTrade.symbol} (Score: ${bestOpp.score})`, 'TRADE');
        }
      }

      // Position Management
      const updatedTrades = engineStateRef.current.trades.map(t => {
        if (t.status !== 'OPEN') return t;
        const currentOpp = newOpportunities.find(o => o.symbol === t.symbol);
        if (!currentOpp) return t;

        const pnlPct = ((currentOpp.price - t.entryPrice) / t.entryPrice) * 100;
        const hitTP = pnlPct >= state.config.takeProfitPercent;
        const hitSL = pnlPct <= -state.config.stopLossPercent;

        if (hitTP || hitSL) {
          addLog(`EXIT: ${t.symbol} ${hitTP ? 'PROFIT' : 'STOP'} at ${pnlPct.toFixed(2)}%`, hitTP ? 'TRADE' : 'WARN');
          return {
            ...t,
            status: 'CLOSED' as const,
            exitPrice: currentOpp.price,
            exitTime: Date.now(),
            pnl: (currentOpp.price - t.entryPrice) * t.quantity,
            pnlPercent: pnlPct
          };
        }
        return { ...t, pnlPercent: pnlPct, pnl: (currentOpp.price - t.entryPrice) * t.quantity };
      });

      const closedThisTick = updatedTrades.filter((t, i) => t.status === 'CLOSED' && engineStateRef.current.trades[i].status === 'OPEN');
      let newBalance = engineStateRef.current.balance;
      closedThisTick.forEach(t => newBalance += t.pnl);

      setState(prev => ({
        ...prev,
        opportunities: newOpportunities,
        trades: updatedTrades,
        balance: newBalance,
        equity: [...prev.equity, newBalance].slice(-100)
      }));

    }, 2000);

    return () => clearInterval(interval);
  }, [state.status, state.config, addLog]);

  const toggleBot = () => {
    if (state.status === BotStatus.OFF) {
      if (state.connection !== ConnectionStatus.CONNECTED || !credentials) return;
      setState(prev => ({ ...prev, status: BotStatus.RUNNING, startTime: Date.now() }));
    } else {
      setState(prev => ({ ...prev, status: BotStatus.OFF }));
    }
  };

  const killSwitch = () => {
    setState(prev => ({
      ...prev,
      status: BotStatus.OFF,
      trades: prev.trades.map(t => t.status === 'OPEN' ? { ...t, status: 'CLOSED', exitTime: Date.now(), exitPrice: t.entryPrice, pnl: 0, pnlPercent: 0 } : t)
    }));
  };

  const isAuthenticated = state.connection === ConnectionStatus.CONNECTED && !!credentials;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0e11] text-[#eaeaeb]">
      <aside className="w-16 lg:w-64 border-r border-[#1e2329] flex flex-col bg-[#0b0e11] z-20">
        <div className="p-6 flex items-center gap-3 border-b border-[#1e2329]">
          <div className="bg-yellow-500 p-2 rounded-xl">
            <Zap className="text-black w-6 h-6" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-xl tracking-tighter">NEXUS<span className="text-yellow-500 italic">PRO</span></h1>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Quant Engine</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-2 mt-4">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity size={20} />} label="Terminal" />
          <NavItem active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} icon={<Globe size={20} />} label="Scanner" />
          <NavItem active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings size={20} />} label="Config" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} label="History" />
        </nav>
        <div className="p-4 border-t border-[#1e2329] space-y-4">
          <button 
            disabled={state.status === BotStatus.RUNNING || !isAuthenticated}
            onClick={() => state.config.mode === TradingMode.SIMULATION ? setShowWarning(true) : setState(prev => ({...prev, config: {...prev.config, mode: TradingMode.SIMULATION}}))}
            className={`w-full py-2 rounded-lg text-[10px] font-black border transition-all ${
              state.config.mode === TradingMode.REAL ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-400'
            } disabled:opacity-30`}
          >
            {state.config.mode === TradingMode.REAL ? 'LIVE MODE' : 'PAPER MODE'}
          </button>
          <button 
            onClick={toggleBot}
            disabled={!isAuthenticated}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-sm transition-all ${
              state.status === BotStatus.RUNNING ? 'bg-red-600' : 'bg-yellow-500 text-black'
            } disabled:bg-gray-800 disabled:text-gray-600`}
          >
            {state.status === BotStatus.RUNNING ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            <span className="hidden lg:inline">{state.status === BotStatus.RUNNING ? 'STOP' : 'START'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0 bg-[#080a0c]">
        <header className="h-14 border-b border-[#1e2329] flex items-center justify-between px-6 bg-[#0b0e11]/80 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {state.connection === ConnectionStatus.CONNECTED ? (
                <div className="flex items-center gap-2">
                  <Wifi size={16} className="text-green-500" />
                  <span className="text-[10px] font-black text-green-500 uppercase">{state.accountName}</span>
                </div>
              ) : (
                <span className="text-[10px] font-black text-gray-500 uppercase">OFFLINE</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
             {state.status === BotStatus.RUNNING && (
               <button onClick={killSwitch} className="px-3 py-1 bg-red-600/10 text-red-500 rounded border border-red-500/20 text-[10px] font-black uppercase">KILL SWITCH</button>
             )}
             <div className="text-right">
               <div className="text-[9px] text-gray-500 font-black uppercase">Equity</div>
               <div className="text-sm font-bold text-white mono">${state.balance.toLocaleString()}</div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="h-full flex items-center justify-center"><ConnectionPanel onConnect={handleConnect} isConnecting={state.connection === ConnectionStatus.CONNECTING} error={state.connection === ConnectionStatus.AUTH_FAILED ? "Auth Failed" : undefined} /></div>
          ) : (
            <div className="p-4 lg:p-6 space-y-6">
              {activeTab === 'dashboard' && <Dashboard state={state} />}
              {activeTab === 'scanner' && <MarketScanner opportunities={state.opportunities} />}
              {activeTab === 'config' && <ConfigPanel config={state.config} updateConfig={(c) => setState(prev => ({...prev, config: {...prev.config, ...c}}))} isRunning={state.status === BotStatus.RUNNING} />}
              {activeTab === 'history' && <TradeHistory trades={state.trades} />}
            </div>
          )}
        </div>
        <div className="h-40 border-t border-[#1e2329] bg-[#0b0e11]"><LogConsole logs={state.logs} /></div>
      </main>

      {showWarning && <RiskWarningModal onConfirm={() => { setState(prev => ({ ...prev, config: { ...prev.config, mode: TradingMode.REAL } })); setShowWarning(false); }} onCancel={() => setShowWarning(false)} />}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
    {icon}<span className="hidden lg:block font-bold text-sm">{label}</span>
  </button>
);

export default App;

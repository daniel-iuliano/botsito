
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
import { BotStatus, TradingMode, TradingConfig, BotState, ConnectionStatus, MarketOpportunity, Trade, LogEntry } from './types';
import Dashboard from './components/Dashboard';
import ConfigPanel from './components/ConfigPanel';
import TradeHistory from './components/TradeHistory';
import LogConsole from './components/LogConsole';
import MarketScanner from './components/MarketScanner';
import RiskWarningModal from './components/RiskWarningModal';
import ConnectionPanel from './components/ConnectionPanel';

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
  
  // In-memory credentials (never persisted)
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
    addLog(`Initiating authentication handshake with Access Key: ${key.substring(0, 4)}...`, "INFO");
    
    // Simulate Backend API Key Validation
    setTimeout(() => {
      if (key.length < 5 || secret.length < 5) {
        setState(prev => ({ ...prev, connection: ConnectionStatus.AUTH_FAILED }));
        addLog("Authentication failed: Invalid credentials format.", "ERROR");
      } else {
        setCredentials({ key, secret });
        setState(prev => ({ 
          ...prev, 
          connection: ConnectionStatus.CONNECTED,
          accountName: "Nexus_Alpha_Quant_01" // Mocked account name
        }));
        addLog("Successfully authenticated. Account identity verified.", "INFO");
        addLog("Real-time data stream established for Spot Market.", "INFO");
      }
    }, 1500);
  };

  // Main Analysis & Execution Loop
  useEffect(() => {
    if (state.status !== BotStatus.RUNNING) return;

    const interval = setInterval(() => {
      // 1. Market Scanner logic (Simulated)
      const newOpportunities: MarketOpportunity[] = SYMBOLS.map(sym => {
        const volatility = Math.random() * 5;
        const basePrice = sym === 'BTC/USDT' ? 68000 : sym === 'ETH/USDT' ? 3500 : 100;
        const currentPrice = basePrice * (1 + (Math.random() - 0.5) * 0.02);
        const rsi = 20 + Math.random() * 60;
        const spread = 0.01 + Math.random() * 0.08;
        const volume = 200000 + Math.random() * 5000000;
        
        let score = 50;
        if (rsi < 40) score += 20; 
        if (spread < 0.03) score += 15; 
        if (volume > 1000000) score += 15; 
        
        return {
          symbol: sym,
          score: Math.min(100, score),
          price: currentPrice,
          change24h: (Math.random() - 0.3) * 10,
          volume24h: volume / 1000000,
          spread: spread,
          indicators: {
            rsi,
            macd: { value: 0.1, signal: 0.05, histogram: 0.05 },
            ema3: currentPrice * 1.001,
            ema9: currentPrice * 1.000,
            ema21: currentPrice * 0.999,
            volatility
          },
          reason: rsi < 35 ? "Oversold RSI Reversal" : "Strong Momentum Breakout"
        };
      }).sort((a, b) => b.score - a.score);

      // 2. Execution logic
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
            entryPrice: bestOpp.price * (1 + bestOpp.spread/100),
            quantity: qty,
            status: 'OPEN',
            pnl: 0,
            pnlPercent: 0,
            entryTime: Date.now(),
            isSimulated: state.config.mode === TradingMode.SIMULATION,
          };
          
          setState(prev => ({
            ...prev,
            trades: [newTrade, ...prev.trades],
          }));
          addLog(`EXECUTED: Scalp Entry on ${newTrade.symbol}`, 'TRADE');
        }
      }

      // 3. Position Management
      const updatedTrades = engineStateRef.current.trades.map(t => {
        if (t.status !== 'OPEN') return t;
        const currentOpp = newOpportunities.find(o => o.symbol === t.symbol);
        if (!currentOpp) return t;

        const pnlPct = ((currentOpp.price - t.entryPrice) / t.entryPrice) * 100;
        const hitTP = pnlPct >= state.config.takeProfitPercent;
        const hitSL = pnlPct <= -state.config.stopLossPercent;

        if (hitTP || hitSL) {
          addLog(`CLOSED: ${t.symbol} at ${pnlPct.toFixed(2)}%`, hitTP ? 'TRADE' : 'WARN');
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
      if (state.connection !== ConnectionStatus.CONNECTED || !credentials) {
        addLog("CRITICAL: Engine cannot start without active API credentials.", "ERROR");
        return;
      }
      addLog(`Nexus Engine Active. Scanning ${SYMBOLS.length} markets...`, "INFO");
      setState(prev => ({ ...prev, status: BotStatus.RUNNING, startTime: Date.now() }));
    } else {
      addLog("Nexus Engine Disengaged.", "INFO");
      setState(prev => ({ ...prev, status: BotStatus.OFF }));
    }
  };

  const killSwitch = () => {
    addLog("EMERGENCY KILL-SWITCH ACTIVATED", "ERROR");
    setState(prev => ({
      ...prev,
      status: BotStatus.OFF,
      trades: prev.trades.map(t => t.status === 'OPEN' ? { ...t, status: 'CLOSED', exitTime: Date.now(), exitPrice: t.entryPrice, pnl: 0, pnlPercent: 0 } : t)
    }));
  };

  const isAuthenticated = state.connection === ConnectionStatus.CONNECTED && !!credentials;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0e11] text-[#eaeaeb]">
      {/* Sidebar */}
      <aside className="w-16 lg:w-64 border-r border-[#1e2329] flex flex-col bg-[#0b0e11] z-20 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-[#1e2329]">
          <div className="bg-yellow-500 p-2 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <Zap className="text-black w-6 h-6" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-xl tracking-tighter">NEXUS<span className="text-yellow-500 italic">PRO</span></h1>
            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Quant Scalper</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-2 mt-4">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity size={20} />} label="Terminal" />
          <NavItem active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} icon={<Globe size={20} />} label="Market Scanner" />
          <NavItem active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings size={20} />} label="Strategy" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} label="Audit Log" />
        </nav>

        <div className="p-4 border-t border-[#1e2329] space-y-4 bg-[#0d1014]">
          <div className="space-y-2">
            <button 
              disabled={state.status === BotStatus.RUNNING || !isAuthenticated}
              onClick={() => state.config.mode === TradingMode.SIMULATION ? setShowWarning(true) : setState(prev => ({...prev, config: {...prev.config, mode: TradingMode.SIMULATION}}))}
              className={`w-full py-2 rounded-lg text-[10px] font-black tracking-widest border transition-all ${
                state.config.mode === TradingMode.REAL 
                  ? 'border-red-500/50 text-red-500 bg-red-500/5 hover:bg-red-500/10' 
                  : 'border-blue-500/50 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10'
              } disabled:opacity-30`}
            >
              {state.config.mode === TradingMode.REAL ? 'LIVE EXCHANGE' : 'PAPER TRADING'}
            </button>
            <button 
              onClick={toggleBot}
              disabled={!isAuthenticated}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-sm tracking-wide transition-all shadow-xl ${
                state.status === BotStatus.RUNNING 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-yellow-500 hover:bg-yellow-400 text-black'
              } disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none`}
            >
              {state.status === BotStatus.RUNNING ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              <span className="hidden lg:inline">{state.status === BotStatus.RUNNING ? 'HALT ENGINE' : 'START ENGINE'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#080a0c]">
        {/* Connection & Status Header */}
        <header className="h-14 border-b border-[#1e2329] flex items-center justify-between px-6 bg-[#0b0e11]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {state.connection === ConnectionStatus.CONNECTED ? (
                <div className="flex items-center gap-2">
                  <Wifi size={16} className="text-green-500" />
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full">
                    <UserCheck size={12} className="text-green-500" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{state.accountName}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <WifiOff size={16} className="text-gray-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">NOT CONNECTED</span>
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-[#1e2329]" />
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">CoinEx Mainnet</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {state.status === BotStatus.RUNNING && (
               <button 
                onClick={killSwitch}
                className="flex items-center gap-2 px-3 py-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded border border-red-500/20 transition-all text-[10px] font-black uppercase"
               >
                 <AlertOctagon size={14} />
                 Kill Switch
               </button>
             )}
             <div className="flex flex-col items-end">
               <span className="text-[9px] text-gray-500 uppercase font-black">Net Equity</span>
               <span className="text-sm font-bold text-white mono">${state.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="h-full flex items-center justify-center p-6">
              <ConnectionPanel 
                onConnect={handleConnect} 
                isConnecting={state.connection === ConnectionStatus.CONNECTING} 
                error={state.connection === ConnectionStatus.AUTH_FAILED ? "Invalid credentials. HMAC handshake failed." : undefined}
              />
            </div>
          ) : (
            <div className="p-4 lg:p-6 space-y-6">
              {activeTab === 'dashboard' && <Dashboard state={state} />}
              {activeTab === 'scanner' && <MarketScanner opportunities={state.opportunities} />}
              {activeTab === 'config' && <ConfigPanel config={state.config} updateConfig={(c) => setState(prev => ({...prev, config: {...prev.config, ...c}}))} isRunning={state.status === BotStatus.RUNNING} />}
              {activeTab === 'history' && <TradeHistory trades={state.trades} />}
            </div>
          )}
        </div>

        {/* Footer Log Console */}
        <div className="h-40 border-t border-[#1e2329] bg-[#0b0e11]">
          <LogConsole logs={state.logs} />
        </div>
      </main>

      {showWarning && (
        <RiskWarningModal 
          onConfirm={() => {
            setState(prev => ({ ...prev, config: { ...prev.config, mode: TradingMode.REAL } }));
            setShowWarning(false);
          }} 
          onCancel={() => setShowWarning(false)} 
        />
      )}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
      active 
        ? 'bg-yellow-500/10 text-yellow-500 shadow-[inset_0_0_10px_rgba(234,179,8,0.05)]' 
        : 'text-gray-500 hover:text-gray-300 hover:bg-[#1e2329]/50'
    }`}
  >
    {icon}
    <span className="hidden lg:block font-bold text-sm tracking-tight">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />}
  </button>
);

export default App;

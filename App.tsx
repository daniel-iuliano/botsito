
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, Square, Settings, Activity, History, Zap, Globe,
  Wifi, WifiOff
} from 'lucide-react';
import { BotStatus, TradingMode, TradingConfig, BotState, ConnectionStatus, LogEntry } from './types';
import Dashboard from './components/Dashboard';
import ConfigPanel from './components/ConfigPanel';
import TradeHistory from './components/TradeHistory';
import LogConsole from './components/LogConsole';
import MarketScanner from './components/MarketScanner';
import RiskWarningModal from './components/RiskWarningModal';
import ConnectionPanel from './components/ConnectionPanel';
import { api } from './services/api';

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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'config' | 'history'>('dashboard');
  const [showWarning, setShowWarning] = useState(false);
  
  const [state, setState] = useState<BotState>({
    status: BotStatus.OFF,
    connection: ConnectionStatus.UNAUTHENTICATED,
    config: INITIAL_CONFIG,
    opportunities: [],
    trades: [],
    logs: [],
    balance: 0,
    equity: [0],
  });

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    setState(prev => ({
      ...prev,
      logs: [{ timestamp: Date.now(), level, message }, ...prev.logs].slice(0, 100)
    }));
  }, []);

  const refreshBalances = useCallback(async () => {
    try {
      const res = await api.request('/api/balances');
      if (res.success) {
        const usdt = res.balances.find((b: any) => b.asset === 'USDT')?.total || 0;
        setState(prev => ({ ...prev, balance: usdt }));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const checkConn = async () => {
      try {
        const res = await api.request('/api/auth');
        if (res.connected) {
          setState(prev => ({ ...prev, connection: ConnectionStatus.CONNECTED, accountName: res.username }));
          refreshBalances();
        } else {
          setState(prev => ({ ...prev, connection: ConnectionStatus.UNAUTHENTICATED }));
        }
      } catch (e) {
        api.clearToken();
        setState(prev => ({ ...prev, connection: ConnectionStatus.UNAUTHENTICATED }));
      }
    };
    checkConn();
  }, [refreshBalances]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const snapshot = await api.request('/api/market');
        setState(prev => ({
          ...prev,
          opportunities: snapshot.opportunities,
          equity: prev.status === BotStatus.RUNNING ? [...prev.equity, prev.balance].slice(-100) : prev.equity
        }));
      } catch (e: any) {
        if (state.status === BotStatus.RUNNING) {
          addLog(`Scanning Error: ${e.message}`, "WARN");
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [state.status, addLog]);

  const handleConnect = async (key: string, secret: string) => {
    setState(prev => ({ ...prev, connection: ConnectionStatus.CONNECTING }));
    addLog(`Initiating secure handshake with CoinEx...`, "INFO");
    
    try {
      const res = await api.request('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ apiKey: key, apiSecret: secret })
      });
      
      api.setToken(res.token);
      setState(prev => ({ 
        ...prev, 
        connection: ConnectionStatus.CONNECTED,
        accountName: res.username
      }));
      addLog(`Secure tunnel verified. Session active as ${res.username}.`, "INFO");
      refreshBalances();
    } catch (error: any) {
      setState(prev => ({ ...prev, connection: ConnectionStatus.AUTH_FAILED }));
      addLog(`Authentication Failed: ${error.message}`, "ERROR");
    }
  };

  const toggleBot = async () => {
    if (state.status === BotStatus.OFF) {
      if (state.connection !== ConnectionStatus.CONNECTED) return;
      try {
        await api.request('/api/bot', { 
          method: 'POST', 
          body: JSON.stringify({ action: 'START', config: state.config }) 
        });
        setState(prev => ({ ...prev, status: BotStatus.RUNNING }));
        addLog("NEXUS Engine Engaged. Active market monitoring started.", "INFO");
      } catch (e: any) {
        addLog(`Engine Engagement Failed: ${e.message}`, "ERROR");
      }
    } else {
      try {
        await api.request('/api/bot', { 
          method: 'POST', 
          body: JSON.stringify({ action: 'STOP' }) 
        });
        setState(prev => ({ ...prev, status: BotStatus.OFF }));
        addLog("NEXUS Engine Disengaged. Positions halted.", "INFO");
      } catch (e) {}
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0e11] text-[#eaeaeb]">
      <aside className="w-16 lg:w-64 border-r border-[#1e2329] flex flex-col bg-[#0b0e11]">
        <div className="p-6 flex items-center gap-3 border-b border-[#1e2329]">
          <div className="bg-yellow-500 p-2 rounded-xl"><Zap className="text-black w-6 h-6" /></div>
          <div className="hidden lg:block">
            <h1 className="font-black text-xl tracking-tighter">NEXUS<span className="text-yellow-500 italic">PRO</span></h1>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-tight">Stateless Instance</span>
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
            disabled={state.status === BotStatus.RUNNING || state.connection !== ConnectionStatus.CONNECTED}
            onClick={() => state.config.mode === TradingMode.SIMULATION ? setShowWarning(true) : setState(prev => ({...prev, config: {...prev.config, mode: TradingMode.SIMULATION}}))}
            className={`w-full py-2 rounded-lg text-[10px] font-black border transition-all ${
              state.config.mode === TradingMode.REAL ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-blue-500 text-blue-400 bg-blue-500/5'
            } disabled:opacity-20`}
          >
            {state.config.mode === TradingMode.REAL ? 'LIVE PRODUCTION' : 'PAPER SIMULATION'}
          </button>
          <button 
            onClick={toggleBot}
            disabled={state.connection !== ConnectionStatus.CONNECTED}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-sm transition-all ${
              state.status === BotStatus.RUNNING ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.2)]'
            } disabled:opacity-50`}
          >
            {state.status === BotStatus.RUNNING ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            <span className="hidden lg:inline">{state.status === BotStatus.RUNNING ? 'HALT' : 'ENGAGE'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#080a0c]">
        <header className="h-14 border-b border-[#1e2329] flex items-center justify-between px-6 bg-[#0b0e11]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {state.connection === ConnectionStatus.CONNECTED ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{state.accountName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-500/10 rounded-full border border-gray-500/20">
                <WifiOff size={14} className="text-gray-500" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Disconnected</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <button onClick={refreshBalances} className="text-[10px] text-gray-500 hover:text-white uppercase font-black transition-colors">Sync</button>
            <div className="text-right">
              <div className="text-[9px] text-gray-500 font-black uppercase">Available USDT</div>
              <div className="text-sm font-bold text-white mono">${state.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {state.connection !== ConnectionStatus.CONNECTED ? (
            <div className="h-full flex items-center justify-center p-6 animate-in fade-in duration-700">
              <ConnectionPanel 
                onConnect={handleConnect} 
                isConnecting={state.connection === ConnectionStatus.CONNECTING} 
                error={state.connection === ConnectionStatus.AUTH_FAILED ? "Verification failed. Check keys." : undefined}
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
        <div className="h-40 border-t border-[#1e2329] bg-[#0b0e11]"><LogConsole logs={state.logs} /></div>
      </main>

      {showWarning && (
        <RiskWarningModal 
          onConfirm={() => { setState(prev => ({ ...prev, config: { ...prev.config, mode: TradingMode.REAL } })); setShowWarning(false); }} 
          onCancel={() => setShowWarning(false)} 
        />
      )}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
    {icon}<span className="hidden lg:block font-bold text-sm tracking-tight">{label}</span>
  </button>
);

export default App;

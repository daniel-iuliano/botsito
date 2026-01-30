
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BotState } from '../types';
import { DollarSign, Zap, TrendingUp, Percent, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';

const Dashboard: React.FC<{ state: BotState }> = ({ state }) => {
  const closedTrades = state.trades.filter(t => t.status === 'CLOSED');
  const winRate = closedTrades.length > 0 ? (closedTrades.filter(t => t.pnl > 0).length / closedTrades.length) * 100 : 0;
  const totalPnl = closedTrades.reduce((acc, curr) => acc + curr.pnl, 0);
  const openTrades = state.trades.filter(t => t.status === 'OPEN');

  const chartData = state.equity.map((val, idx) => ({ time: idx, equity: val }));

  return (
    <div className="space-y-6">
      {/* Top Level Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Session PnL" 
          value={`$${totalPnl.toFixed(2)}`} 
          subValue="Real-time performance"
          icon={<DollarSign size={18} />}
          trend={totalPnl >= 0 ? 1 : -1}
        />
        <SummaryCard 
          title="Engine Accuracy" 
          value={`${winRate.toFixed(1)}%`} 
          subValue={`${closedTrades.length} trades executed`}
          icon={<Zap size={18} />}
        />
        <SummaryCard 
          title="Market Reach" 
          value={state.opportunities.length.toString()} 
          subValue="Tradable pairs scanned"
          icon={<Globe size={18} />}
        />
        <SummaryCard 
          title="Risk Exposure" 
          value={`${((openTrades.length / state.config.maxOpenPositions) * 100).toFixed(0)}%`} 
          subValue={`${openTrades.length} active positions`}
          icon={<Percent size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Graph */}
        <div className="lg:col-span-2 bg-[#1e2329] border border-[#2b3139] p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black tracking-tight">EQUITY EVOLUTION</h3>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Last 100 Ticks</div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" vertical={false} />
                <XAxis hide dataKey="time" />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '12px' }}
                  labelClassName="hidden"
                />
                <Area type="monotone" dataKey="equity" stroke="#eab308" fillOpacity={1} fill="url(#equityGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hot Opportunities Widget */}
        <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 bg-[#2b3139]/30 border-b border-[#2b3139] flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-yellow-500">Hot Leads</h3>
            <Zap size={14} className="text-yellow-500" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {state.opportunities.slice(0, 5).map((opp, idx) => (
              <div key={opp.symbol} className={`p-3 border-b border-[#2b3139] hover:bg-white/5 transition-all flex items-center gap-3`}>
                <div className="text-xs font-black text-gray-500 w-4">0{idx+1}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{opp.symbol}</div>
                  <div className="text-[10px] text-gray-500 mono">${opp.price.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-black mono ${opp.score > 80 ? 'text-green-500' : 'text-yellow-500'}`}>{opp.score}</div>
                  <div className="text-[9px] font-bold text-gray-600 uppercase">Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Trades Table */}
      <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl overflow-hidden">
        <div className="p-4 bg-[#2b3139]/30 border-b border-[#2b3139] text-xs font-black uppercase tracking-widest">Active Scalp Execution</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-[#2b3139]">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Market</th>
                <th className="px-6 py-4">Entry</th>
                <th className="px-6 py-4">Current PnL</th>
                <th className="px-6 py-4">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {openTrades.map(trade => (
                <tr key={trade.id} className="border-b border-[#2b3139] hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">{trade.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{trade.symbol}</td>
                  <td className="px-6 py-4 text-xs font-mono">${trade.entryPrice.toFixed(2)}</td>
                  <td className={`px-6 py-4 text-sm font-black mono ${trade.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4">
                     <div className="w-20 bg-[#0b0e11] rounded-full h-1">
                        <div className="bg-yellow-500 h-full rounded-full" style={{ width: '40%' }} />
                     </div>
                  </td>
                </tr>
              ))}
              {openTrades.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-gray-600 font-bold uppercase tracking-widest italic">No active positions. Scanning markets...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, subValue, icon, trend }: { title: string; value: string; subValue: string; icon: React.ReactNode; trend?: number }) => (
  <div className="bg-[#1e2329] border border-[#2b3139] p-5 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-[#2b3139] rounded-lg text-yellow-500">{icon}</div>
      {trend !== undefined && (
        <div className={`p-1 rounded-full ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </div>
      )}
    </div>
    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{title}</div>
    <div className="text-2xl font-black mono text-white leading-none mb-1">{value}</div>
    <div className="text-[10px] text-gray-500 font-medium">{subValue}</div>
  </div>
);

export default Dashboard;

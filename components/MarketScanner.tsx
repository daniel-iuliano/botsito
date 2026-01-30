
import React from 'react';
import { MarketOpportunity } from '../types';
import { TrendingUp, TrendingDown, Info, Zap, AlertTriangle } from 'lucide-react';

const MarketScanner: React.FC<{ opportunities: MarketOpportunity[] }> = ({ opportunities }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tighter">INTELLIGENT SCANNER</h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Evaluating {opportunities.length} live pairs against quant metrics</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase border border-yellow-500/20">Alpha Engine v2.4</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {opportunities.map((opp) => (
          <div key={opp.symbol} className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-5 hover:border-yellow-500/40 transition-all group relative overflow-hidden">
            {/* Background Heat Gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 opacity-20 pointer-events-none transition-all duration-700 ${opp.score > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight">{opp.symbol}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${opp.change24h >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {opp.change24h >= 0 ? '+' : ''}{opp.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">Vol: ${opp.volume24h.toFixed(2)}M • Spread: {opp.spread.toFixed(3)}%</div>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-black mono leading-none ${opp.score > 75 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {opp.score}
                </div>
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Op. Score</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
               <IndicatorBadge label="RSI" value={opp.indicators.rsi.toFixed(1)} color={opp.indicators.rsi < 35 ? 'text-green-500' : 'text-gray-400'} />
               <IndicatorBadge label="EMA Delta" value={`${((opp.indicators.ema3 - opp.indicators.ema21)/opp.indicators.ema21 * 100).toFixed(2)}%`} color="text-yellow-500" />
               <IndicatorBadge label="ATR Vol" value={opp.indicators.volatility.toFixed(2)} color="text-gray-400" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400">
                <Info size={12} />
                {opp.reason}
              </div>
              <div className="flex gap-1">
                {opp.score > 80 && <Zap size={14} className="text-yellow-500 fill-yellow-500 animate-pulse" />}
                {opp.spread > 0.05 && <AlertTriangle size={14} className="text-orange-500" title="High Spread" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const IndicatorBadge = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-black/20 border border-[#2b3139] rounded-lg p-2 flex flex-col items-center">
    <span className="text-[8px] text-gray-500 font-black uppercase mb-1">{label}</span>
    <span className={`text-[11px] font-mono font-bold ${color}`}>{value}</span>
  </div>
);

export default MarketScanner;

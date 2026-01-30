
import React from 'react';
import { Trade } from '../types';
import { Download, ExternalLink } from 'lucide-react';

const TradeHistory: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  return (
    <div className="bg-[#1e2329] border border-[#2b3139] rounded-xl overflow-hidden">
      <div className="p-6 border-b border-[#2b3139] flex justify-between items-center bg-[#2b3139]/20">
        <div>
          <h3 className="text-xl font-bold">Execution History</h3>
          <p className="text-sm text-gray-500">Full audit log of all completed trades</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2b3139] hover:bg-[#3b4149] rounded-lg text-sm transition-colors">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#2b3139] text-xs text-gray-400 uppercase tracking-widest bg-[#2b3139]/10">
              <th className="px-6 py-4 font-bold">Time</th>
              <th className="px-6 py-4 font-bold">Symbol</th>
              <th className="px-6 py-4 font-bold">Type</th>
              <th className="px-6 py-4 font-bold">Entry/Exit</th>
              <th className="px-6 py-4 font-bold">PnL</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b3139]">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-[#2b3139]/30 transition-colors">
                <td className="px-6 py-4 text-sm mono">
                  {new Date(trade.entryTime).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 font-bold text-white">
                  {trade.symbol}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm mono">
                  <div>In: {trade.entryPrice.toFixed(2)}</div>
                  {trade.exitPrice && <div className="text-gray-500">Out: {trade.exitPrice.toFixed(2)}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className={`font-bold mono ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.pnl !== 0 ? `${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}` : '---'}
                  </div>
                  {trade.pnlPercent !== 0 && (
                    <div className="text-xs text-gray-500">{trade.pnlPercent.toFixed(2)}%</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    trade.status === 'OPEN' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {trade.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${trade.isSimulated ? 'text-blue-400' : 'text-orange-400'}`}>
                    {trade.isSimulated ? 'PAPER' : 'LIVE'}
                  </span>
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-gray-500 italic opacity-50">
                  No trades executed yet. Start the bot to begin scalping.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;

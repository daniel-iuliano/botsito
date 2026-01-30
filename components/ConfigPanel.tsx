
import React from 'react';
import { TradingConfig } from '../types';
import { Info, AlertCircle, Sliders, ShieldCheck, Filter } from 'lucide-react';

const ConfigPanel: React.FC<{ config: TradingConfig; updateConfig: (c: Partial<TradingConfig>) => void; isRunning: boolean }> = ({ config, updateConfig, isRunning }) => {
  
  const SectionHeader = ({ icon, title, color }: { icon: React.ReactNode, title: string, color: string }) => (
    <div className="flex items-center gap-2 mb-6">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
        {icon}
      </div>
      <h3 className="text-lg font-black tracking-tight uppercase">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter">ENGINE SETTINGS</h2>
        <p className="text-gray-500 font-medium uppercase text-xs tracking-widest">Configure the Nexus Pro quantitative model and safety protocols</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Filter Settings */}
        <section className="bg-[#1e2329] border border-[#2b3139] p-8 rounded-3xl space-y-8">
          <SectionHeader icon={<Filter size={20} />} title="Market Scanner" color="text-blue-400" />
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Min Opportunity Score</label>
              <input 
                type="range" min="50" max="95" step="1"
                disabled={isRunning}
                value={config.minOpportunityScore}
                onChange={(e) => updateConfig({ minOpportunityScore: Number(e.target.value) })}
                className="w-full h-1.5 bg-black rounded-full appearance-none accent-yellow-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-mono text-gray-500">
                <span>Conservative (50)</span>
                <span className="text-yellow-500 font-bold">{config.minOpportunityScore}</span>
                <span>Aggressive (95)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Max Concurrent Pairs</label>
                  <input 
                    type="number" 
                    disabled={isRunning}
                    value={config.maxOpenPositions}
                    onChange={(e) => updateConfig({ maxOpenPositions: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-[#2b3139] p-3 rounded-xl mono text-white outline-none focus:border-blue-500 transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Min 24h Vol (USD)</label>
                  <input 
                    type="number" 
                    disabled={isRunning}
                    value={config.minVolumeUSD}
                    onChange={(e) => updateConfig({ minVolumeUSD: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-[#2b3139] p-3 rounded-xl mono text-white outline-none focus:border-blue-500 transition-all"
                  />
               </div>
            </div>
          </div>
        </section>

        {/* Quant Strategy Settings */}
        <section className="bg-[#1e2329] border border-[#2b3139] p-8 rounded-3xl space-y-8">
          <SectionHeader icon={<Sliders size={20} />} title="Quant Model" color="text-yellow-500" />
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">RSI Oversold</label>
              <input 
                type="number" 
                disabled={isRunning}
                value={config.rsiOversold}
                onChange={(e) => updateConfig({ rsiOversold: Number(e.target.value) })}
                className="w-full bg-black/40 border border-[#2b3139] p-3 rounded-xl mono text-green-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">RSI Overbought</label>
              <input 
                type="number" 
                disabled={isRunning}
                value={config.rsiOverbought}
                onChange={(e) => updateConfig({ rsiOverbought: Number(e.target.value) })}
                className="w-full bg-black/40 border border-[#2b3139] p-3 rounded-xl mono text-red-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Take Profit %</label>
              <input 
                type="number" step="0.1"
                disabled={isRunning}
                value={config.takeProfitPercent}
                onChange={(e) => updateConfig({ takeProfitPercent: Number(e.target.value) })}
                className="w-full bg-black/40 border border-[#2b3139] p-3 rounded-xl mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Stop Loss %</label>
              <input 
                type="number" step="0.1"
                disabled={isRunning}
                value={config.stopLossPercent}
                onChange={(e) => updateConfig({ stopLossPercent: Number(e.target.value) })}
                className="w-full bg-black/40 border border-[#2b3139] p-3 rounded-xl mono"
              />
            </div>
          </div>
        </section>
      </div>

      {isRunning && (
        <div className="mt-8 p-6 bg-red-600/10 border border-red-600/30 rounded-2xl flex items-center gap-4 text-red-500 animate-pulse">
           <AlertCircle size={24} />
           <div>
              <div className="font-black uppercase text-sm tracking-widest">Core Logic Locked</div>
              <div className="text-xs font-medium">To modify quant parameters, first disengage the engine from the sidebar.</div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;

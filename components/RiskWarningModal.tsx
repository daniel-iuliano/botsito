
import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

const RiskWarningModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1e2329] border border-[#2b3139] max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-[#2b3139] flex justify-between items-center">
          <div className="flex items-center gap-3 text-red-500">
            <AlertTriangle className="animate-bounce" />
            <h3 className="text-xl font-bold uppercase tracking-tighter">High Risk Warning</h3>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-200 leading-relaxed">
              You are about to switch the bot to <strong>REAL TRADING MODE</strong>. Nexus Scalper will use your real CoinEx account funds for high-frequency execution.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                <ShieldCheck size={20} className="text-yellow-500" />
              </div>
              <p className="text-sm text-gray-400">
                Ensure your API keys have <span className="text-white font-bold underline">Spot Trading</span> permissions enabled, but <span className="text-red-500 font-bold underline">Withdrawal</span> disabled.
              </p>
            </div>
            
            <ul className="text-xs text-gray-500 list-disc pl-5 space-y-2">
              <li>Scalping involves significant risk and high slippage potential.</li>
              <li>Network latency can affect order execution speed.</li>
              <li>Ensure you have sufficient USDT/Base currency for the selected pair.</li>
              <li>Nexus Pro uses HMAC-SHA256 signing for all requests.</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 px-6 bg-[#2b3139] hover:bg-[#3b4149] text-white font-bold rounded-xl transition-all"
            >
              STAY IN SIM
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 transition-all"
            >
              ACTIVATE LIVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskWarningModal;

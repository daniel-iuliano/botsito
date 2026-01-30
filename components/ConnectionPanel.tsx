
import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, ChevronRight } from 'lucide-react';

interface ConnectionPanelProps {
  onConnect: (key: string, secret: string) => void;
  isConnecting: boolean;
  error?: string;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ onConnect, isConnecting, error }) => {
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim() && secret.trim()) {
      onConnect(key, secret);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#1e2329] border border-[#2b3139] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-4 border border-yellow-500/20">
            <Lock className="text-yellow-500" size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">CoinEx Connectivity</h2>
          <p className="text-gray-500 text-sm font-medium">
            Enter your API credentials to access the spot market. 
            <span className="block mt-1 text-yellow-500/80 italic font-bold">
              Keys are stored in memory only and lost on refresh.
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Access Key</label>
            <div className="relative">
              <input 
                type="text"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-black/40 border border-[#2b3139] p-4 rounded-xl text-white outline-none focus:border-yellow-500 transition-all font-mono text-sm"
                placeholder="Ex: 8A7B2C..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Secret Key</label>
            <div className="relative">
              <input 
                type={showSecret ? "text" : "password"}
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full bg-black/40 border border-[#2b3139] p-4 rounded-xl text-white outline-none focus:border-yellow-500 transition-all font-mono text-sm"
                placeholder="••••••••••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold animate-pulse">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isConnecting || !key || !secret}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center justify-center gap-2"
          >
            {isConnecting ? "Verifying..." : "Establish Connection"}
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#2b3139] flex items-center gap-3 text-xs text-gray-500 font-medium">
          <ShieldCheck size={16} className="text-green-500" />
          <span>Institutional-grade HMAC encryption active</span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPanel;

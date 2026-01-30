
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

const LogConsole: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // We keep latest at top, or use append
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2b3139] bg-[#1e2329]/50">
        <Terminal size={14} className="text-gray-400" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Engine Logs</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 mono text-[12px]"
      >
        {logs.map((log, i) => (
          <div key={`${log.timestamp}-${i}`} className="flex gap-4 group">
            <span className="text-gray-600 shrink-0">
              [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
            </span>
            <span className={`shrink-0 font-bold ${
              log.level === 'TRADE' ? 'text-yellow-500' :
              log.level === 'WARN' ? 'text-orange-500' :
              log.level === 'ERROR' ? 'text-red-500' :
              'text-blue-400'
            }`}>
              {log.level}
            </span>
            <span className={`${log.level === 'TRADE' ? 'text-white font-medium' : 'text-gray-400'}`}>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-700 italic">No events logged...</div>
        )}
      </div>
    </div>
  );
};

export default LogConsole;

import React from 'react';
import { Activity } from 'lucide-react';

const mockSignals = [
  { time: '14:22:05', msg: 'Whale Accumulation detected in $ETH', type: 'bullish' },
  { time: '14:21:50', msg: 'Suez Canal maritime traffic anomaly', type: 'alert' },
  { time: '14:20:10', msg: 'Form 4 Insider Buying recorded: NVDA', type: 'bullish' },
  { time: '14:15:33', msg: 'Extreme Fear Sentiment: Broad Tech Sector', type: 'bearish' },
  { time: '14:12:00', msg: 'Abnormal Volatility Spike: Tokyo Exchange', type: 'alert' },
  { time: '14:10:45', msg: 'Large capital outflow block: SOXX ETF', type: 'bearish' },
];

export const SignalFeedSidebar: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col font-mono">
            <div className="bg-[#121212] p-3 border-b border-[#262626] flex items-center gap-2">
                <Activity size={14} className="text-[#d6ff3f]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Alpha Signal Stream</span>
                <span className="ml-auto w-1.5 h-1.5 bg-[#d6ff3f] rounded-full animate-pulse shadow-[0_0_8px_#d6ff3f]"></span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {mockSignals.map((sig, idx) => (
                    <div key={idx} className="flex gap-3 border-b border-[#262626] pb-2 last:border-0 hover:bg-[#262626]/20 p-1 transition cursor-default">
                        <span className="text-[#475569] text-[9px] shrink-0 mt-0.5">{sig.time}</span>
                        <span className={`text-[11px] leading-tight flex-1 ${
                            sig.type === 'bullish' ? 'text-[#d6ff3f]' : 
                            sig.type === 'bearish' ? 'text-[#ff4d4d]' : 'text-slate-300'
                        }`}>
                            {sig.msg}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

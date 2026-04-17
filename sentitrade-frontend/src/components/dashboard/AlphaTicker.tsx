import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const signalPool = [
  { asset: "BTC", text: "Whale moved 5,000 BTC to exchange", type: "bear", confidence: 91 },
  { asset: "NVDA", text: "Reddit mentions +400% in 1 hour", type: "bull", confidence: 87 },
  { asset: "OIL", text: "Cargo ship rerouted near Strait of Hormuz", type: "alert", confidence: 78 },
  { asset: "SPY", text: "Fed language sentiment turned hawkish", type: "bear", confidence: 82 },
  { asset: "TSLA", text: "CEO tweet sentiment score: 94 bullish", type: "bull", confidence: 88 },
  { asset: "GOLD", text: "Geopolitical risk index spiked +2.1σ", type: "alert", confidence: 73 }
];

interface AlphaTickerProps {
  onSignalClick?: (signal: any) => void;
}

export const AlphaTicker: React.FC<AlphaTickerProps> = ({ onSignalClick }) => {
  const [signals, setSignals] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Initial feed
    const initialSignals = [...signalPool].sort(() => 0.5 - Math.random()).slice(0, 3).map(s => ({
        ...s,
        id: Math.random().toString(36).substring(7),
        time: "Just now"
    }));
    setSignals(initialSignals);

    const interval = setInterval(() => {
      if (!isPaused) {
        const randomSignal = signalPool[Math.floor(Math.random() * signalPool.length)];
        const newSignal = {
            ...randomSignal,
            id: Math.random().toString(36).substring(7),
            time: "1s ago"
        };
        
        setSignals(prev => {
            const updated = [newSignal, ...prev];
            // Update times for older signals (mock behavior)
            const aged = updated.map((s, idx) => {
                if (idx > 0) {
                   const secondsOld = parseInt(s.time.replace(/[^0-9]/g, '')) || 0;
                   return { ...s, time: `${secondsOld + 3}s ago` };
                }
                return s;
            });
            // Max 12 items
            return aged.slice(0, 12);
        });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div 
        className="fixed right-0 top-0 bottom-0 w-[280px] bg-[#080812] border-l border-obsidian-border z-40 flex flex-col hidden xl:flex shadow-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
    >
        <div className="p-4 border-b border-obsidian-border bg-[#0a0a16] flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse"></span>
                Alpha Feed
            </h3>
            {isPaused && <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900 px-2 py-1 rounded">Paused</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            <AnimatePresence>
                {signals.map((signal) => {
                    let dotColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
                    if (signal.type === 'bull') dotColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
                    if (signal.type === 'bear') dotColor = 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)]';

                    return (
                        <motion.div
                            key={signal.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.3 }}
                            className="bg-black/40 border border-slate-800 rounded-lg p-3 hover:border-slate-600 cursor-pointer transition-colors group relative overflow-hidden"
                            onClick={() => onSignalClick && onSignalClick(signal)}
                        >
                            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] bg-slate-800 text-slate-300 px-1 rounded uppercase">Why?</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                                <span className="font-bold text-white text-sm">{signal.asset}</span>
                                <span className="text-[10px] text-slate-500 ml-auto font-mono">{signal.time}</span>
                            </div>
                            <p className="text-xs text-slate-300 font-mono leading-tight mb-2">
                                {signal.text}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-500/20">
                                    {signal.confidence}% CONF
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface PanicMeterProps {
  onMeterClick?: () => void;
}

export const PanicMeter: React.FC<PanicMeterProps> = ({ onMeterClick }) => {
  const [score, setScore] = useState(50);
  const [history, setHistory] = useState<number[]>([50, 52, 48, 55, 50]);
  const [banner, setBanner] = useState<'euphoria' | 'panic' | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setScore(prev => {
        // Drift between 10 and 95
        const change = (Math.random() - 0.5) * 20; 
        let newScore = Math.max(5, Math.min(95, prev + change));
        
        // Update history
        setHistory(h => {
            const nextH = [...h, newScore];
            return nextH.slice(-5); // keep last 5
        });

        // Trigger banners
        if (newScore > 85 && banner !== 'euphoria') {
            setBanner('euphoria');
        } else if (newScore < 20 && banner !== 'panic') {
            setBanner('panic');
        } else if (newScore >= 20 && newScore <= 85) {
            setBanner(null);
        }

        return newScore;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [banner]);

  // SVG Gauge calculations
  // Angle from -90deg (0) to +90deg (100)
  const rotation = -90 + (score / 100) * 180;

  // Polyline points for sparkline
  const sparkPoints = history.map((val, idx) => {
    const x = (idx / 4) * 200; // 200 width
    // val 0-100 -> y from 40 down to 0
    const y = 40 - (val / 100) * 40; 
    return `${x},${y}`;
  }).join(' ');

  let statusText = "NEUTRAL";
  let statusColor = "text-amber-500";
  if (score > 80) { statusText = "EUPHORIA"; statusColor = "text-neon animate-pulse"; }
  else if (score > 60) { statusText = "GREED"; statusColor = "text-emerald-400"; }
  else if (score < 20) { statusText = "PANIC"; statusColor = "text-rose-600 font-bold"; }
  else if (score < 40) { statusText = "FEAR"; statusColor = "text-rose-400"; }

  return (
    <>
        {/* Banner Overlay */}
        <AnimatePresence>
            {banner && (
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-[120] px-6 py-3 rounded-lg flex items-center gap-4 shadow-2xl border ${banner === 'euphoria' ? 'bg-amber-900/90 border-amber-500 text-amber-100' : 'bg-rose-900/90 border-rose-500 text-rose-100'}`}
                >
                    <AlertTriangle className={banner === 'euphoria' ? 'text-amber-400' : 'text-rose-400'} />
                    <span className="font-bold font-mono text-sm max-w-md">
                        {banner === 'euphoria' ? '⚠ CAUTION: Market Euphoria Detected — Consensus at 85%+ historically precedes correction.' : '🔴 PANIC SIGNAL: Extreme Fear — Potential capitulation event forming.'}
                    </span>
                    <button onClick={() => setBanner(null)} className="ml-4 hover:opacity-75"><X size={18} /></button>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Widget Container */}
        <div 
            className="w-[220px] bg-obsidian-card border border-obsidian-border rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-slate-600 transition-colors shadow-lg relative group"
            onClick={onMeterClick}
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] bg-slate-800 text-slate-300 px-1 rounded uppercase">Why?</span>
            </div>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Market Sentiment</h3>
            
            <div className="relative w-[180px] h-[90px] overflow-hidden mb-2">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                    {/* Definitions for Glow */}
                    <defs>
                        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Gauge Background Arcs */}
                    {/* 0-20 Panic */}
                    <path d="M 10,100 A 90,90 0 0,1 37,37" fill="none" stroke="#be123c" strokeWidth="12" />
                    {/* 20-40 Fear */}
                    <path d="M 37,37 A 90,90 0 0,1 69,18" fill="none" stroke="#fb7185" strokeWidth="12" />
                    {/* 40-60 Neutral */}
                    <path d="M 69,18 A 90,90 0 0,1 131,18" fill="none" stroke="#d97706" strokeWidth="12" />
                    {/* 60-80 Greed */}
                    <path d="M 131,18 A 90,90 0 0,1 163,37" fill="none" stroke="#34d399" strokeWidth="12" />
                    {/* 80-100 Euphoria */}
                    <path d="M 163,37 A 90,90 0 0,1 190,100" fill="none" stroke="#00ff88" strokeWidth="12" filter="url(#neon-glow)" />

                    {/* Needle */}
                    <g style={{ transform: `translate(100px, 100px) rotate(${rotation}deg)`, transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <polygon points="-4,0 4,0 0,-85" fill="#e2e8f0" />
                        <circle cx="0" cy="0" r="6" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
                    </g>
                </svg>

                {/* Score Text Overlay */}
                <div className="absolute bottom-0 left-0 w-full text-center">
                    <div className="text-2xl font-bold text-white font-mono">{Math.round(score)}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-widest ${statusColor}`}>{statusText}</div>
                </div>
            </div>

            {/* Sparkline */}
            <div className="w-full mt-2">
                <svg viewBox="0 0 200 40" className="w-full h-[30px]" preserveAspectRatio="none">
                    <polyline 
                        points={sparkPoints} 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth="2" 
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    </>
  );
};

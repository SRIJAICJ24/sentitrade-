import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

const contagionMap: Record<string, string[]> = {
  "NVDA": ["AMD", "SMCI", "TSM", "QCOM", "INTC"],
  "BTC":  ["ETH", "SOL", "COIN", "MSTR", "BNB"],
  "SPY":  ["QQQ", "DIA", "IWM", "VTI", "SCHD"],
  "OIL":  ["XOM", "CVX", "HAL", "BP", "SLB"]
};

interface ContagionModalProps {
  asset: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ContagionModal: React.FC<ContagionModalProps> = ({ asset, isOpen, onClose }) => {
  const [animationKey, setAnimationKey] = useState(0);
  
  if (!isOpen) return null;

  // Re-trigger animation
  const handleRunAgain = () => {
    setAnimationKey(prev => prev + 1);
  };

  const targets = contagionMap[asset] || ["ASSET-X", "ASSET-Y", "ASSET-Z"];
  const numTargets = targets.length;
  
  // Calculate polar coordinates for the target nodes around the center
  const radius = 140;
  const cx = 300;
  const cy = 250;

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-4">
        {/* Style tag for CSS keyframes within this component scope */}
        <style>
            {`
            @keyframes pulseCenter {
                0% { fill: #be123c; r: 35; }
                50% { fill: #f43f5e; r: 42; stroke-width: 10px; stroke: rgba(225,29,72,0.4); }
                100% { fill: #be123c; r: 35; }
            }
            @keyframes drawLine {
                from { stroke-dashoffset: 200; }
                to { stroke-dashoffset: 0; }
            }
            @keyframes spreadInfection {
                0% { fill: #334155; }
                50% { fill: #d97706; } /* Amber */
                100% { fill: #be123c; } /* Red */
            }
            @keyframes fadeInText {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            `}
        </style>

        {/* Modal content area */}
        <div className="w-full max-w-3xl relative">
            <button 
                onClick={onClose}
                className="absolute top-0 right-0 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full z-10 transition-colors"
            >
                <X size={24} />
            </button>

            <div className="text-center mb-8 animate-[fadeInText_0.5s_ease-out_forwards]">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tighter">Systemic Risk Contagion</h2>
                <p className="text-slate-400 text-sm">Mapping exposure fallout stemming from {asset} liquidity gap.</p>
            </div>

            {/* SVG Graph Container */}
            <div className="w-full flex justify-center bg-obsidian-card border border-white/5 rounded-2xl shadow-2xl overflow-hidden pt-4 pb-12 mb-6 pointer-events-none" key={animationKey}>
                <svg width="600" height="500" viewBox="0 0 600 500" className="mx-auto block" preserveAspectRatio="xMidYMid meet">
                    {/* Definitions for gradients/glows */}
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Lines container from center to outer targets */}
                    {targets.map((tgt, i) => {
                        const angle = (Math.PI * 2 * i) / numTargets - Math.PI / 2;
                        const tx = cx + Math.cos(angle) * radius;
                        const ty = cy + Math.sin(angle) * radius;
                        
                        return (
                            <line 
                                key={`line-${i}`}
                                x1={cx} y1={cy} 
                                x2={tx} y2={ty}
                                stroke="#f43f5e" 
                                strokeWidth="2"
                                strokeDasharray="200"
                                strokeDashoffset="200"
                                style={{
                                    animation: `drawLine 0.5s linear forwards`,
                                    animationDelay: `${0.4 + i * 0.2}s`
                                }}
                            />
                        );
                    })}

                    {/* Outer Target Nodes */}
                    {targets.map((tgt, i) => {
                        const angle = (Math.PI * 2 * i) / numTargets - Math.PI / 2;
                        const tx = cx + Math.cos(angle) * radius;
                        const ty = cy + Math.sin(angle) * radius;
                        const riskNum = Math.floor(15 + Math.random() * 50);

                        return (
                            <g key={`node-${i}`}>
                                <circle 
                                    cx={tx} cy={ty} r="28" 
                                    fill="#334155" 
                                    stroke="rgba(255,255,255,0.1)" strokeWidth="2"
                                    style={{
                                        animation: `spreadInfection 1.5s linear forwards`,
                                        animationDelay: `${0.8 + i * 0.2}s`
                                    }}
                                />
                                <text x={tx} y={ty - 2} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" style={{ opacity: 0, animation: 'fadeInText 0.3s forwards', animationDelay: `${0.8 + i*0.2}s`}}>{tgt}</text>
                                <text x={tx} y={ty + 14} fill="#fca5a5" fontSize="10" textAnchor="middle" style={{ opacity: 0, animation: 'fadeInText 0.3s forwards', animationDelay: `${0.8 + i*0.2}s`}}>{riskNum}%</text>
                            </g>
                        );
                    })}

                    {/* Center Node (Source of Contagion) */}
                     <g>
                        <circle 
                            cx={cx} cy={cy} r="35" 
                            fill="#be123c" 
                            filter="url(#glow)"
                            style={{ animation: 'pulseCenter 1.5s infinite' }}
                        />
                        <text x={cx} y={cy + 5} fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">{asset}</text>
                    </g>
                </svg>
            </div>

            {/* Timeline Log */}
            <div className="bg-black/50 border border-slate-800 rounded-xl p-4 font-mono text-sm shadow-inner overflow-hidden mb-6 h-[120px] overflow-y-auto">
                <div key={animationKey}>
                    <p className="text-rose-500 mb-2">T+0.0s: {asset} capitulation triggers margin warnings...</p>
                    {targets.map((tgt, i) => (
                        <p 
                            key={`log-${i}`} 
                            className="text-slate-400 opacity-0"
                            style={{ animation: 'fadeInText 0.3s forwards', animationDelay: `${0.8 + i*0.2}s`}}
                        >
                            <span className="text-amber-500">T+{((0.8 + i*0.2)).toFixed(1)}s:</span> Spread to {tgt} — Liquidity drains from order book. 
                        </p>
                    ))}
                    <p 
                        className="text-rose-400 font-bold opacity-0 mt-2"
                        style={{ animation: 'fadeInText 0.3s forwards', animationDelay: `${1.0 + targets.length * 0.2}s`}}
                    >
                        --- SIMULATION END: Systemic containment failed. ---
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center">
                <button 
                    onClick={handleRunAgain}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded font-bold transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                >
                    <RefreshCw size={16} /> RUN AGAIN
                </button>
            </div>

        </div>
    </div>
  );
};

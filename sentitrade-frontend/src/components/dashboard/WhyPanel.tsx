import React from 'react';
import { X, ArrowUpRight, ArrowDownRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const mockWhy = {
    asset: "NVDA",
    score: 87,
    breakdown: [
      { type: "Social", weight: 45, color: "#7F77DD" },
      { type: "Macro", weight: 30, color: "#1D9E75" },
      { type: "Geospatial", weight: 15, color: "#BA7517" },
      { type: "Guardian", weight: 10, color: "#639922" }
    ],
    sources: [
      { id: 1, text: "r/wallstreetbets: NVDA to the moon post with 12k upvotes", authority: "High", age: "4m ago", icon: "[REDDIT]" },
      { id: 2, text: "Fed minutes: AI infrastructure spending language positive", authority: "High", age: "2h ago", icon: "[NEWS]" },
      { id: 3, text: "AIS: No supply chain disruptions in Taiwan Strait", authority: "Medium", age: "1h ago", icon: "[GEO]" }
    ],
    agentVerdicts: { macro: "bull", social: "bull", guardian: "neutral", executioner: "bull" }
};

interface WhyPanelProps {
  signal: any;
  isOpen: boolean;
  onClose: () => void;
}

export const WhyPanel: React.FC<WhyPanelProps> = ({ signal, isOpen, onClose }) => {
  if (!isOpen) return null;

  // We map the incoming signal to mock data or use it directly
  // For now using mockWhy to ensure all required fields are present
  const data = mockWhy;

  return (
    <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-[100] h-[45vh] bg-[#0c0c16] border-t border-indigo-500/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex flex-col xl:w-[calc(100%-280px)]"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white tracking-tight">XAI Interrogation</h2>
                        <span className="font-mono text-sm px-2 py-1 bg-indigo-900/40 text-indigo-300 rounded border border-indigo-500/30">
                            Subject: {signal?.asset || data.asset}
                        </span>
                        <span className="font-mono text-sm px-2 py-1 bg-green-900/40 text-green-400 rounded border border-green-500/30">
                            Score: {signal?.score || data.score}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Col: Composition & Agents */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Signal Composition</h3>
                            {/* Stacked Bar */}
                            <div className="w-full h-8 flex overflow-hidden rounded mb-3 bg-slate-800">
                                {data.breakdown.map((item, i) => (
                                    <motion.div 
                                        key={item.type}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.weight}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                                        style={{ backgroundColor: item.color }}
                                        className="h-full border-r border-black/20 last:border-0"
                                    />
                                ))}
                            </div>
                            {/* Legend */}
                            <div className="flex flex-wrap gap-4 text-xs font-mono">
                                {data.breakdown.map((item) => (
                                    <div key={item.type} className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
                                        <span className="text-slate-300">{item.type} ({item.weight}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Agent Consensus</h3>
                            <div className="flex gap-4">
                                {Object.entries(data.agentVerdicts).map(([agent, verdict]) => {
                                    let Icon = Shield;
                                    let iconColor = "text-slate-400";
                                    let bgColor = "bg-slate-800";
                                    
                                    if (verdict === 'bull') {
                                        Icon = ArrowUpRight;
                                        iconColor = "text-emerald-400";
                                        bgColor = "bg-emerald-900/30";
                                    } else if (verdict === 'bear') {
                                        Icon = ArrowDownRight;
                                        iconColor = "text-rose-400";
                                        bgColor = "bg-rose-900/30";
                                    }

                                    return (
                                        <div key={agent} className={`flex flex-col items-center p-3 rounded-xl border border-white/5 ${bgColor}`}>
                                            <Icon className={iconColor} size={24} />
                                            <span className="text-[10px] uppercase font-mono mt-2 text-slate-300">{agent}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Evidence Source list */}
                    <div className="flex-1 lg:max-w-md bg-black/30 rounded-xl border border-white/5 p-4 overflow-y-auto">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Primary Evidence</h3>
                        <div className="space-y-3">
                            {data.sources.map(src => (
                                <div key={src.id} className="p-3 bg-[#0a0a12] border border-white/5 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-xs font-mono">
                                            <span className="text-indigo-400">{src.icon}</span>
                                            <span className="text-slate-500">{src.age}</span>
                                        </div>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${src.authority === 'High' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-amber-900/40 text-amber-500'}`}>
                                            {src.authority} Authority
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-tight">
                                        {src.text.length > 80 ? src.text.substring(0, 80) + '...' : src.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

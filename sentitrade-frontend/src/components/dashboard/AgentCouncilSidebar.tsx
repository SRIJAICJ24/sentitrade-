import React from 'react';
import { Cpu, Globe, MessageSquare, Ship } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';

export const AgentCouncilSidebar: React.FC = () => {
    const { activeAsset } = useMarketStore();
    
    // Generative stub based on current asset
    const getReasoning = (agent: string, asset: string | null) => {
        const target = asset || 'Global Equities';
        
        switch(agent) {
            case 'Macro':
                return `Evaluating Fed impact on ${target}. Short-term supply chains stabilizing, but persistent rate friction indicates capped upside. Recommending structural hedge.`;
            case 'Social':
                return `Retail euphoria detected for ${target}. +340% mention volume spike on Reddit pre-market. Extreme greed indexing suggests imminent contrarian correction.`;
            case 'Whale':
                return `On-chain/EDGAR monitoring confirms $120M block accumulation of ${target} into cold storage/institutional lockups over the last 96 hours. Institutional conviction is HIGH.`;
            default:
                return 'Awaiting input...';
        }
    };

    return (
        <div className="w-full h-full flex flex-col font-mono bg-[#121212] border border-[#262626] rounded-sm p-4 overflow-hidden">
            <h3 className="font-bold text-white tracking-widest uppercase flex items-center gap-2 text-sm mb-4 border-b border-[#262626] pb-2">
                <Cpu size={16} className="text-[#a855f7]" />
                Sovereign Agent Council
            </h3>
            
            <div className="space-y-4 flex-1">
                {/* Macro Agent */}
                <div className="bg-[#000000] border border-[#262626] rounded-sm p-3 hover:border-blue-500/50 transition">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                            <Globe size={14} /> Agent: MACRO
                        </div>
                        <span className="text-[9px] px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">NEUTRAL-BEARISH</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed shadow-inner">
                        {getReasoning('Macro', activeAsset)}
                    </p>
                </div>

                {/* Social Agent */}
                <div className="bg-[#000000] border border-[#262626] rounded-sm p-3 hover:border-[#ff4d4d]/50 transition">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-[#ff4d4d] font-bold text-xs uppercase tracking-widest">
                            <MessageSquare size={14} /> Agent: SOCIAL
                        </div>
                        <span className="text-[9px] px-2 py-0.5 bg-[#ff4d4d]/20 text-[#ff4d4d] rounded">EXTREME SELL</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed shadow-inner">
                        {getReasoning('Social', activeAsset)}
                    </p>
                </div>

                {/* Whale Agent */}
                <div className="bg-[#000000] border border-[#262626] rounded-sm p-3 hover:border-[#d6ff3f]/50 transition">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-[#d6ff3f] font-bold text-xs uppercase tracking-widest shadow-[0_0_8px_rgba(214,255,63,0.1)]">
                            <Ship size={14} /> Agent: BLOCKCHAIN / SEC
                        </div>
                        <span className="text-[9px] px-2 py-0.5 bg-[#d6ff3f]/20 text-[#d6ff3f] rounded">STRONG BUY</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed shadow-inner">
                        {getReasoning('Whale', activeAsset)}
                    </p>
                </div>
            </div>
            
            <div className="mt-4 pt-2 border-t border-[#262626] flex justify-between items-center text-[9px] text-[#475569] tracking-widest uppercase">
                <span>Council Consensus:</span>
                <span className="text-white font-bold px-2 py-1 bg-[#262626] rounded">DIVERGENCE DETECTED</span>
            </div>
        </div>
    );
};

import React from 'react';
import { useDivergence } from '../hooks/useDivergence';
import { ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

export const DivergenceDetector: React.FC = () => {
    const { divergence, loading } = useDivergence();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-xl border border-obsidian-border animate-pulse">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-neon animate-spin"></div>
                    <span className="text-[10px] text-slate-500 font-mono">SCANNING FOR DIVERGENCE...</span>
                </div>
            </div>
        );
    }

    if (!divergence) {
        return (
            <div className="w-full h-48 flex flex-col items-center justify-center bg-obsidian-card rounded-xl border border-obsidian-border">
                <Zap size={24} className="text-slate-700 mb-2" />
                <span className="text-xs text-slate-500 font-mono">NO DIVERGENCE DETECTED</span>
            </div>
        );
    }

    const isBullish = divergence.divergence_type === 'bullish';
    // High Contrast Styles
    const cardStyle = isBullish
        ? 'bg-gradient-to-br from-green-900/30 to-black border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
        : 'bg-gradient-to-br from-red-900/30 to-black border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]';

    const titleColor = isBullish ? 'text-green-400' : 'text-red-400';
    const Icon = isBullish ? ArrowUpRight : ArrowDownRight;

    return (
        <div className={`relative w-full p-6 rounded-xl border ${cardStyle} overflow-hidden group`}>
            {/* Animated Border Glow */}
            <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]`}></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`p-1 rounded ${isBullish ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                <Icon size={16} />
                            </span>
                            <h2 className={`text-xl font-extrabold tracking-tight ${titleColor}`}>
                                {isBullish ? 'BULLISH DIVERGENCE' : 'BEARISH DIVERGENCE'}
                            </h2>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                            Pattern Detected: {new Date(divergence.detected_at).toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-white font-mono tracking-tighter">
                            {divergence.reversal_probability}%
                        </div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Probability</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/40 rounded border border-white/5">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Price Trend</span>
                        <span className={`text-lg font-bold font-mono ${isBullish ? 'text-red-400' : 'text-green-400'}`}>
                            {divergence.price_change_percent > 0 ? '↑' : '↓'} {Math.abs(divergence.price_change_percent)}%
                        </span>
                    </div>
                    <div className="p-3 bg-black/40 rounded border border-white/5">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Sentiment</span>
                        <span className={`text-lg font-bold font-mono ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
                            {divergence.sentiment_change_percent > 0 ? '↑' : '↓'} {Math.abs(divergence.sentiment_change_percent)}%
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-[9px] text-slate-500 mb-1 font-mono">
                        <span>CONFIDENCE</span>
                        <span>STRONG</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${isBullish ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${divergence.reversal_probability}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

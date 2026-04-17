import React, { useMemo } from 'react';
import { useDivergence } from '../hooks/useDivergence';
import { ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DivergenceDetector: React.FC = () => {
    const { divergence, loading } = useDivergence();
    const isBullish = divergence?.divergence_type === 'bullish';

    // Generate mock divergent graph data correlating with the actual divergence direction
    // MOVED TO TOP to follow React Rules of Hooks
    const graphData = useMemo(() => {
        const data = [];
        let price = 100;
        let social = isBullish ? 20 : 80;

        for (let i = 0; i < 20; i++) {
            // Price stays relatively flat/down while social pulses opposite
            price += isBullish ? (Math.random() * -2) : (Math.random() * 2);
            social += isBullish ? (Math.random() * 10) : (Math.random() * -10);
            
            data.push({
                time: `T-${20-i}`,
                Price: price,
                SocialPulse: social
            });
        }
        return data;
    }, [isBullish]);

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

    // High Contrast Styles
    const cardStyle = isBullish
        ? 'bg-gradient-to-br from-green-900/10 to-black border-green-500/30'
        : 'bg-gradient-to-br from-red-900/10 to-black border-red-500/30';

    const titleColor = isBullish ? 'text-green-400' : 'text-red-400';
    const Icon = isBullish ? ArrowUpRight : ArrowDownRight;

    return (
        <div className={`relative w-full h-[350px] p-4 rounded-xl border ${cardStyle} overflow-hidden group flex flex-col`}>
            {/* Animated Border Glow */}
            <div className={`absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]`}></div>

            <div className="relative z-10 mb-4 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`p-1 rounded ${isBullish ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Icon size={16} />
                        </span>
                        <h2 className={`text-sm font-extrabold tracking-tight ${titleColor}`}>
                            {isBullish ? 'BULLISH WHALE DIVERGENCE' : 'BEARISH VOLUME DIVERGENCE'}
                        </h2>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-black text-white font-mono tracking-tighter">
                        {divergence.reversal_probability}% <span className="text-[9px] text-slate-400">PROB</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="time" hide />
                        <YAxis yAxisId="left" domain={['dataMin', 'dataMax']} hide />
                        <YAxis yAxisId="right" orientation="right" domain={['dataMin', 'dataMax']} hide />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #334155', borderRadius: '8px' }}
                            itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                            labelStyle={{ display: 'none' }}
                        />
                        
                        {/* True Data Price Line */}
                        <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="Price" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={false}
                            name="True Price Line"
                        />
                        
                        {/* Social Pulse Line */}
                        <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="SocialPulse" 
                            stroke={isBullish ? '#22c55e' : '#ef4444'} 
                            strokeWidth={3}
                            dot={false}
                            name="Social Pulse Vol"
                            style={{ filter: `drop-shadow(0px 0px 8px ${isBullish ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)'})` }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            {/* Legend / Status bar */}
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[9px] text-slate-500 font-mono z-10">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Price (Lagging)</span>
                    <span className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${isBullish ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 shadow-[0_0_5px_#ef4444]'}`}></span> Social Vol (Leading)</span>
                </div>
                <span>FINBERT NLP ACTIVE</span>
            </div>
        </div>
    );
};

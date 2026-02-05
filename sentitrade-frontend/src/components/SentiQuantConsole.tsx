import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Sparkles, Terminal } from 'lucide-react';

interface ThoughtEntry {
    timestamp: string;
    thought: string;
    level: 'info' | 'success' | 'warning' | 'error';
    asset?: string;
}

interface SentiQuantConsoleProps {
    thoughts: ThoughtEntry[];
}

export const SentiQuantConsole: React.FC<SentiQuantConsoleProps> = ({ thoughts: propThoughts }) => {
    // Merge props with some local state for demo purposes if needed, or just use props
    const thoughts = propThoughts;
    const [isExpanded, setIsExpanded] = useState(true);
    const consoleRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [thoughts]);

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'success': return <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 uppercase">SIGNAL</span>;
            case 'warning': return <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px] font-bold border border-yellow-500/30 uppercase">ALERT</span>;
            case 'error': return <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 uppercase">CRITICAL</span>;
            default: return <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 text-[10px] font-bold border border-slate-600 uppercase">INFO</span>;
        }
    };

    const formatTime = (isoString: string): string => {
        try {
            return new Date(isoString).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
        } catch { return '--:--:--'; }
    };

    const quickActions = [
        "Audit my Portfolio",
        "Analyze Nifty Divergence",
        "Gold Sentiment?",
        "Whale Watch"
    ];

    return (
        <div className="w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-700 rounded text-neon/80">
                        <Terminal size={14} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white font-mono tracking-tight">SENTI-QUANT TERMINAL</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] text-slate-500 font-mono">LIVE INTELLIGENCE STREAM</span>
                        </div>
                    </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono border border-slate-700 px-2 py-1 rounded">
                    FinBERT-v2: ACTIVE
                </div>
            </div>

            {/* Console Body */}
            {isExpanded && (
                <>
                    <div
                        ref={consoleRef}
                        className="h-64 overflow-y-auto p-4 font-mono text-[11px] bg-[#050505] space-y-2 border-b border-slate-800"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {thoughts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-700 gap-2">
                                <Sparkles size={24} className="opacity-20" />
                                <span>Awaiting Market Signals...</span>
                            </div>
                        ) : (
                            thoughts.map((thought, idx) => (
                                <div key={idx} className="flex items-start gap-3 hover:bg-white/5 p-1 rounded transition-colors group">
                                    <span className="text-slate-600 shrink-0 select-none">
                                        {formatTime(thought.timestamp)}
                                    </span>
                                    <div className="shrink-0">
                                        {getLevelBadge(thought.level)}
                                    </div>
                                    <span className={`leading-relaxed group-hover:text-white transition-colors ${thought.level === 'success' ? 'text-emerald-100' : 'text-slate-300'}`}>
                                        {thought.thought}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Quick Actions Footer */}
                    <div className="p-3 bg-slate-900">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Quick Actions:</span>
                            {quickActions.map((action) => (
                                <button
                                    key={action}
                                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] rounded-full hover:border-neon hover:text-neon transition-all whitespace-nowrap"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

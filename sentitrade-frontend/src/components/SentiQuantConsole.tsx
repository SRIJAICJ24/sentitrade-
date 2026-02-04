import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface ThoughtEntry {
    timestamp: string;
    thought: string;
    level: 'info' | 'success' | 'warning' | 'error';
    asset?: string;
}

export const SentiQuantConsole: React.FC = () => {
    const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const consoleRef = useRef<HTMLDivElement>(null);
    const { lastMessage } = useWebSocket();

    // Listen for AI thoughts from WebSocket
    useEffect(() => {
        if (lastMessage?.type === 'ai_thought') {
            const newThought = lastMessage.data as ThoughtEntry;
            setThoughts(prev => [...prev.slice(-49), newThought]); // Keep last 50
        }
    }, [lastMessage]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [thoughts]);

    const getLevelColor = (level: string): string => {
        switch (level) {
            case 'success': return 'text-emerald-400';
            case 'warning': return 'text-amber-400';
            case 'error': return 'text-red-400';
            default: return 'text-slate-300';
        }
    };

    const getAssetBadge = (asset?: string): string => {
        if (!asset) return '';
        const colors: Record<string, string> = {
            'BTC': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
            'AAPL': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            'GOLD': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        };
        return colors[asset] || 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    };

    const formatTime = (isoString: string): string => {
        try {
            return new Date(isoString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        } catch {
            return '--:--:--';
        }
    };

    return (
        <div className="w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-lg font-bold text-white font-mono">Senti-Quant Console</h3>
                    <span className="text-xs text-slate-500">AI Thoughts Stream</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{thoughts.length} entries</span>
                    <button className="text-slate-400 hover:text-white transition">
                        {isExpanded ? '▼' : '▲'}
                    </button>
                </div>
            </div>

            {/* Console Body */}
            {isExpanded && (
                <div
                    ref={consoleRef}
                    className="h-64 overflow-y-auto p-4 font-mono text-sm bg-slate-950 space-y-1"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {thoughts.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-600">
                            <span>Waiting for AI thoughts...</span>
                        </div>
                    ) : (
                        thoughts.map((thought, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-2 py-1 ${idx === thoughts.length - 1 ? 'animate-pulse' : ''
                                    }`}
                            >
                                <span className="text-slate-600 shrink-0">
                                    [{formatTime(thought.timestamp)}]
                                </span>
                                {thought.asset && (
                                    <span className={`px-1.5 py-0.5 text-xs rounded border shrink-0 ${getAssetBadge(thought.asset)}`}>
                                        {thought.asset}
                                    </span>
                                )}
                                <span className={getLevelColor(thought.level)}>
                                    {thought.thought}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> FinBERT Active
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" /> Stream Live
                    </span>
                </div>
                <button
                    onClick={() => setThoughts([])}
                    className="text-xs text-slate-500 hover:text-slate-300 transition"
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

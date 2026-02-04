import React from 'react';
import { useSignal } from '../../hooks/useSignal';

export const PatternRadar: React.FC = () => {
    const { signal, loading } = useSignal();

    if (loading || !signal) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 h-64 flex items-center justify-center">
                <span className="text-slate-500">Scanning for patterns...</span>
            </div>
        );
    }

    const correlation = signal.correlation || 0;
    const patterns = signal.patterns || [];

    // Helper to get correlation color
    const getCorrColor = (val: number) => {
        if (val > 0.7) return 'text-green-400';
        if (val < -0.7) return 'text-red-400';
        return 'text-cyan-400';
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col h-full shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📡</span> Pattern Radar
            </h2>

            {/* Correlation Meter */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Price/Sentiment Correlation</span>
                    <span className={`font-mono font-bold ${getCorrColor(correlation)}`}>
                        {correlation.toFixed(2)}
                    </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden relative">
                    {/* Center line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500"></div>

                    {/* Bar */}
                    <div
                        className={`h-full absolute transition-all duration-500 ${correlation > 0 ? 'bg-green-500/50' : 'bg-red-500/50'}`}
                        style={{
                            left: correlation > 0 ? '50%' : `${50 + (correlation * 50)}%`,
                            width: `${Math.abs(correlation) * 50}%`
                        }}
                    ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Divergence (-1)</span>
                    <span>Neutral (0)</span>
                    <span>Correlation (+1)</span>
                </div>
            </div>

            {/* Active Patterns */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {patterns.length > 0 ? (
                    patterns.map((p, idx) => (
                        <div key={idx} className="bg-slate-700/50 rounded p-3 border border-slate-600">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-cyan-300 text-sm">{p.name}</span>
                                <span className="text-xs bg-black/30 px-2 py-0.5 rounded text-white">
                                    {(p.confidence * 100).toFixed(0)}% Conf
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-tight">{p.description}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-slate-600 text-sm">
                        No anomalous patterns detected.
                    </div>
                )}
            </div>

            {/* Reasoning Snippet if available */}
            {signal.reasoning && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-400 italic">
                        "{signal.reasoning.split(".")[0]}..."
                    </p>
                </div>
            )}
        </div>
    );
};

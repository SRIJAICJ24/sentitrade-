import React, { useState, useEffect } from 'react';
import { useMLWorker } from '../../hooks/useMLWorker';
import { Cpu, ListFilter, AlertTriangle } from 'lucide-react';

import { useMarketStore } from '../../store/marketStore';

const baseMockSignals = [
  "Whale moved 5,000 BTC to exchange. Very bearish sentiment detected on crypto Twitter.",
  "Reddit mentions for NVDA skyrocketed 400% in 1 hour following CEO commentary.",
  "Fed language sentiment turned increasingly hawkish during the latest press conference.",
  "TSLA CEO tweet sentiment score reached 94 bullish after new product announcement.",
];

export const IntelligenceBriefs: React.FC = () => {
    const { isReady, progress, analyzeText } = useMLWorker();
    const { activeAsset } = useMarketStore();
    const [briefs, setBriefs] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Simulate ingesting signal stream and analyzing locally using ONNX
    useEffect(() => {
        if (!isReady) return;

        const processSignals = async () => {
            setIsAnalyzing(true);
            
            // Scenario 2 Override: Infrastructure Black Swan
            const isCommodity = activeAsset && ['USO', 'OIL', 'BRENT'].includes(activeAsset.toUpperCase());
            const signalsToProcess = isCommodity ? [
                "WorldMonitor internal API detects a massive container ship grounded in the Suez Canal, fully blocking bidirectional transit.",
                "Algorithm correlates the physical maritime bottleneck to an immediate 15% reduction in European oil supply capacity.",
                "Geopolitical risk index spiked +4.2σ in the Middle East routing corridor.",
                "Automated recommendation: Immediate accumulation of shipping equities and long-dated Oil Future Contracts (Calls)."
            ] : baseMockSignals;

            const results = [];
            for (const text of signalsToProcess) {
                try {
                    const analysis = await analyzeText(text);
                    results.push(analysis);
                } catch (e) {
                    console.error("Worker extraction failed", e);
                }
            }
            
            // Cluster the results mock-style based on entities
            const clustered = results.reduce((acc: any, cur) => {
                const group = isCommodity ? 'SUEZ CANAL BOTTLENECK' : (cur.entities.length > 0 ? cur.entities[0] : 'MACRO');
                if (!acc[group]) acc[group] = [];
                acc[group].push(cur.originalText);
                return acc;
            }, {});

            const synthesizedBriefs = Object.keys(clustered).map(key => ({
                theme: key,
                signals: clustered[key],
                sentiment: key === 'SUEZ CANAL BOTTLENECK' || key === 'MACRO' ? 'CRITICAL RISK / ALPHA' : 'Actionable'
            }));

            setBriefs(synthesizedBriefs);
            setIsAnalyzing(false);
        };

        processSignals();
    }, [isReady, activeAsset]);

    return (
        <div className="bg-obsidian-card border border-obsidian-border rounded-xl flex flex-col overflow-hidden h-full">
            <div className="bg-black/40 p-4 border-b border-obsidian-border flex justify-between items-center">
                <h3 className="font-bold text-white uppercase tracking-widest font-mono text-sm flex items-center gap-2">
                    <ListFilter className="text-purple-400" size={16} />
                    Intelligence Briefs
                </h3>
                <div className="flex items-center gap-2">
                    {!isReady ? (
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Cpu size={12} /> Model Loading ({progress?.progress?.toFixed(0) || 0}%)
                        </span>
                    ) : (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Local NLP Active
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-4"></div>
                        <span className="font-mono text-xs uppercase tracking-widest">Synthesizing Signals...</span>
                    </div>
                ) : briefs.length === 0 ? (
                    <div className="text-center text-slate-600 font-mono py-8">Awaiting Signal Injection</div>
                ) : (
                    briefs.map((brief, idx) => (
                        <div key={idx} className="bg-black/30 border border-slate-800 rounded-lg p-4 hover:border-slate-600 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-white text-lg font-mono">{brief.theme} Narrative</h4>
                                <span className={`text-[10px] uppercase font-mono px-2 py-1 rounded border ${
                                    brief.sentiment === 'High Risk' ? 'bg-rose-900/40 text-rose-400 border-rose-500/30' : 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30'
                                }`}>
                                    {brief.sentiment}
                                </span>
                            </div>
                            <ul className="space-y-2">
                                {brief.signals.map((sig: string, i: number) => (
                                    <li key={i} className="text-xs text-slate-300 font-mono leading-relaxed pl-3 border-l-2 border-purple-500/30">
                                        {sig}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

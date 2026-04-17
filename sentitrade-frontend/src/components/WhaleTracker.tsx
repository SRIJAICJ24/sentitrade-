import React from 'react';
import { useWhales } from '../hooks/useWhales';
import { useMarketStore } from '../store/marketStore';
import { Network, FileText, AlertTriangle, ArrowRightCircle } from 'lucide-react';

export const WhaleTracker: React.FC = () => {
    const { whales, smartMoneyScore, loading } = useWhales();
    const { activeAsset } = useMarketStore();

    const maskWallet = (address: string): string => {
        if (!address) return 'Unknown';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getTrustColor = (score: number): string => {
        if (score >= 90) return 'text-green-400';
        if (score >= 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getTxBadgeColor = (txType: string): string => {
        return txType === 'accumulation'
            ? 'bg-green-900/30 text-green-400 border-green-600'
            : 'bg-red-900/30 text-red-400 border-red-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg">
                <div className="animate-spin h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Scenario Generator based on Active Asset
    const isCrypto = activeAsset && ['BTC', 'ETH', 'SOL'].includes(activeAsset.toUpperCase());
    const isCryptoScenario = activeAsset === 'BTC'; // specifically for the VC pitch

    return (
        <div className="w-full bg-obsidian-card rounded-xl border border-obsidian-border p-5 shadow-2xl h-[500px] flex flex-col group hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                    <Network size={16} className="text-indigo-400" />
                    BIG PLAYER INTELLIGENCE
                </h2>
                <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-mono rounded">
                    {isCrypto ? 'ON-CHAIN' : 'SEC EDGAR'}
                </span>
            </div>

            {/* SCENARIO 1 OVERRIDE: Whale-Retail Divergence */}
            {isCryptoScenario && (
                <div className="mb-4 bg-red-900/20 border border-red-500/50 p-3 rounded-lg animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase mb-1">
                        <AlertTriangle size={14} /> Critical Network Divergence
                    </div>
                    <p className="text-slate-300 text-xs font-mono mb-2">
                        Retail sentiment reflects EXTREME FEAR (Social Score: -85). However, network nodes have detected <strong className="text-green-400">~$502M USD (7,854 BTC)</strong> transferring from Binance Hot Wallets to previously unseen Cold Storage.
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-500/20">
                        <span className="text-[10px] text-slate-500 font-mono">SYSTEM LOGIC:</span>
                        <span className="text-[10px] text-green-400 font-bold uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                            COUNTER-SENTIMENT BUY SIGNAL
                        </span>
                    </div>
                </div>
            )}

            {/* Smart Money Score */}
            {!isCryptoScenario && smartMoneyScore && (
                <div className="mb-4 p-3 bg-black/40 rounded border border-white/5 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Institutional Conviction</span>
                        <span className="text-lg font-black text-white font-mono">{smartMoneyScore.conviction_score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${smartMoneyScore.conviction_score > 70 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}
                            style={{ width: `${smartMoneyScore.conviction_score}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Activity Feed */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                
                {/* Simulated SEC Filings if it's a Stock */}
                {!isCrypto && activeAsset && (
                    <>
                        <div className="p-3 bg-black/30 rounded border border-white/5 hover:border-indigo-500/30 transition group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-slate-500" />
                                    <span className="text-xs font-bold text-white tracking-widest">FORM 4 (INSIDER)</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">14 MINS AGO</span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono">
                                CEO executed open market purchase of 250,500 shares @ $142.50. High conviction signal.
                            </p>
                        </div>
                        <div className="p-3 bg-black/30 rounded border border-white/5 hover:border-indigo-500/30 transition group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-slate-500" />
                                    <span className="text-xs font-bold text-white tracking-widest">13F (INSTITUTIONAL)</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">2 HRS AGO</span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono">
                                Vanguard Group increased holding position by +15% (~$450M USD equivalent).
                            </p>
                        </div>
                    </>
                )}

                {/* Whale Transactions */}
                {whales && whales.length > 0 ? (
                    whales.map((whale, idx) => (
                        <div key={`${whale.wallet_address}-${idx}`} className="p-3 bg-black/30 rounded border border-white/5">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${whale.tx_type === 'accumulation' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="text-[10px] font-mono text-slate-400">{maskWallet(whale.wallet_address)}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-white font-mono">
                                        ${(whale.amount_usd / 1000000).toFixed(1)}M
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                                    {whale.tx_type === 'accumulation' ? 'EXCHANGE ➔ COLD WALLET' : 'COLD WALLET ➔ EXCHANGE'}
                                </div>
                                <div className={`text-[10px] font-mono ${getTrustColor(whale.trust_score)}`}>
                                    Trust: {whale.trust_score}%
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    !isCrypto && !isCryptoScenario && (
                        <div className="text-center py-8 text-slate-600 font-mono text-xs">
                            Awaiting Block/Clearing Data...
                        </div>
                    )
                )}
            </div>
            
            <button className="mt-4 w-full py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] uppercase font-bold tracking-widest hover:bg-indigo-500 hover:text-white transition flex items-center justify-center gap-2">
                Launch Full Node Explorer <ArrowRightCircle size={12} />
            </button>
        </div>
    );
};

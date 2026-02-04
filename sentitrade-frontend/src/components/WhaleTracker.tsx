import React from 'react';
import { useWhales } from '../hooks/useWhales';

export const WhaleTracker: React.FC = () => {
    const { whales, smartMoneyScore, loading } = useWhales();

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

    return (
        <div className="w-full bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg h-96 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-4">Whale Activity</h2>

            {/* Smart Money Score */}
            {smartMoneyScore && (
                <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600 shrink-0">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-300">Smart Money Score</span>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                    style={{ width: `${smartMoneyScore.conviction_score}%` }}
                                />
                            </div>
                            <span className="text-xl font-bold text-cyan-400">{smartMoneyScore.conviction_score}%</span>
                        </div>
                    </div>
                    <span className={`text-xs mt-2 inline-block px-2 py-1 rounded ${smartMoneyScore.conviction_score > 70
                            ? 'bg-green-900/40 text-green-400'
                            : 'bg-red-900/40 text-red-400'
                        }`}>
                        {smartMoneyScore.conviction_score > 70 ? 'Bullish' : 'Bearish'}
                    </span>
                </div>
            )}

            {/* Whale Activity Feed */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {whales && whales.length > 0 ? (
                    whales.map((whale, idx) => (
                        <div
                            key={`${whale.wallet_address}-${idx}`}
                            className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-mono text-gray-400">
                                            {maskWallet(whale.wallet_address)}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-semibold border rounded ${getTxBadgeColor(whale.tx_type)}`}>
                                            {whale.tx_type === 'accumulation' ? '📈 BUY' : '📉 SELL'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(whale.timestamp).toLocaleString()}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-bold text-cyan-400">
                                        ${(whale.amount_usd / 1000000).toFixed(2)}M
                                    </div>
                                    <div className={`text-xs font-semibold ${getTrustColor(whale.trust_score)}`}>
                                        Trust: {whale.trust_score}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No whale activity yet
                    </div>
                )}
            </div>
        </div>
    );
};

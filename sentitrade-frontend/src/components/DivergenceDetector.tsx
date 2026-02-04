import React from 'react';
import { useDivergence } from '../hooks/useDivergence';

export const DivergenceDetector: React.FC = () => {
    const { divergence, loading } = useDivergence();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 bg-slate-800 rounded-lg">
                <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!divergence) {
        return (
            <div className="w-full p-6 bg-slate-800 rounded-lg border border-slate-700 text-center text-gray-500">
                No divergence detected
            </div>
        );
    }

    const isBullish = divergence.divergence_type === 'bullish';
    const bgColor = isBullish ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600';

    return (
        <div className={`w-full p-6 rounded-lg border-2 ${bgColor} shadow-lg`}>
            <h2 className="text-2xl font-bold text-white mb-4">
                {isBullish ? '📊 Bullish Divergence' : '📈 Bearish Divergence'}
            </h2>

            <div className="space-y-4">
                {/* Trend Comparison */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                        <span className="text-xs text-gray-400 block mb-1">Sentiment Trend</span>
                        <span className={`text-2xl font-bold ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
                            {divergence.sentiment_change_percent > 0 ? '↑' : '↓'} {Math.abs(divergence.sentiment_change_percent)}%
                        </span>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                        <span className="text-xs text-gray-400 block mb-1">Price Trend</span>
                        <span className={`text-2xl font-bold ${isBullish ? 'text-red-400' : 'text-green-400'}`}>
                            {divergence.price_change_percent > 0 ? '↑' : '↓'} {Math.abs(divergence.price_change_percent)}%
                        </span>
                    </div>
                </div>

                {/* Probability */}
                <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-300">Reversal Probability</span>
                        <span className="text-2xl font-bold text-yellow-400">{divergence.reversal_probability}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${divergence.reversal_probability}%` }}
                        />
                    </div>
                </div>

                {/* Historical Data */}
                <div className="p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-xs text-gray-400 block mb-1">Avg Historical Profit</span>
                    <span className="text-lg font-bold text-green-400">
                        +{(divergence.historical_avg_profit * 100).toFixed(0)}%
                    </span>
                </div>

                {/* Detected Time */}
                <div className="text-xs text-gray-500 text-center pt-2">
                    Detected: {new Date(divergence.detected_at).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};

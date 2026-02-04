import React, { useEffect, useState } from 'react';
import { useSentiment } from '../hooks/useSentiment';

export const SentimentGauge: React.FC = () => {
    const { data: sentiment, loading, error } = useSentiment();
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        if (sentiment?.sentiment_score) {
            // Smooth animation from current to target
            let currentScore = animatedScore;
            const interval = setInterval(() => {
                currentScore += (sentiment.sentiment_score - currentScore) * 0.1;
                if (Math.abs(sentiment.sentiment_score - currentScore) < 1) {
                    currentScore = sentiment.sentiment_score;
                    clearInterval(interval);
                }
                setAnimatedScore(Math.round(currentScore));
            }, 50);
            return () => clearInterval(interval);
        }
    }, [sentiment?.sentiment_score]);

    const getColor = (score: number): string => {
        if (score < 30) return 'text-red-500';
        if (score < 70) return 'text-yellow-500';
        return 'text-green-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-slate-800 rounded-xl">
                <div className="animate-spin h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !sentiment) {
        return (
            <div className="flex items-center justify-center h-64 bg-red-900/20 border border-red-500 rounded-xl">
                <span className="text-red-400">Failed to load sentiment</span>
            </div>
        );
    }

    return (
        <div className="w-full h-auto p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Market Sentiment</h2>

            {/* Gauge Container */}
            <div className="flex flex-col items-center justify-center">
                {/* Circular Gauge */}
                <div className="relative w-48 h-48 rounded-full bg-slate-800 border-8 border-slate-600 flex items-center justify-center shadow-xl">
                    {/* Needle */}
                    <div
                        className="absolute w-1 h-24 bg-white rounded-full origin-bottom transition-transform duration-1000"
                        style={{
                            transform: `rotate(${(animatedScore / 100) * 180 - 90}deg)`,
                            bottom: '50%',
                        }}
                    />

                    {/* Center dot */}
                    <div className="absolute w-4 h-4 bg-white rounded-full"></div>

                    {/* Score Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${getColor(animatedScore)}`}>
                            {animatedScore}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">Score</span>
                    </div>
                </div>

                {/* Confidence Badge */}
                <div className="mt-6 text-center">
                    <span className="text-sm text-gray-400">Confidence: </span>
                    <span className="text-lg font-semibold text-cyan-400">{sentiment.confidence}%</span>
                </div>

                {/* Bullish/Bearish counts */}
                <div className="mt-4 flex gap-8 text-center">
                    <div>
                        <span className="text-2xl font-bold text-green-400">{sentiment.bullish_count.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 block">Bullish</span>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-red-400">{sentiment.bearish_count.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 block">Bearish</span>
                    </div>
                </div>
            </div>

            {/* Source Breakdown - 2x2 Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4">
                {Object.entries(sentiment.sources).map(([source, data]) => (
                    <div key={source} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-300 capitalize">{source}</span>
                            <span className="text-2xl font-bold text-cyan-400">{(data as any).quality}%</span>
                        </div>
                        <span className="text-xs text-gray-500">{(data as any).count.toLocaleString()} sources</span>
                    </div>
                ))}
            </div>

            {/* Last Update */}
            <div className="mt-6 text-center text-xs text-gray-500">
                Updated: {new Date(sentiment.updated_at).toLocaleTimeString()}
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignal } from '../hooks/useSignal';

export const TradingSignal: React.FC = () => {
    const { signal, loading } = useSignal();
    const [dismissed, setDismissed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!signal) return;

        const expiryTime = new Date(signal.expires_at).getTime();
        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                setDismissed(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [signal]); // Changed dependency to whole signal object to reset on new signal

    if (!signal || dismissed || loading) return null;

    const isBuy = signal.action === 'BUY';
    const bgColor = isBuy ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600';
    const textColor = isBuy ? 'text-green-400' : 'text-red-400';
    const buttonColor = isBuy
        ? 'bg-green-600 hover:bg-green-700'
        : 'bg-red-600 hover:bg-red-700';

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`w-full p-6 rounded-lg border-2 ${bgColor} shadow-lg`}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left: Signal Info */}
                    <div>
                        <h3 className="text-sm text-gray-400 mb-2">Signal</h3>
                        <div className={`text-4xl font-bold ${textColor}`}>{signal.action}</div>
                        <div className="text-xs text-gray-500 mt-1">{signal.asset_code}</div>
                    </div>

                    {/* Center: Price Levels */}
                    <div className="space-y-2">
                        <div>
                            <span className="text-xs text-gray-400">Entry:</span>
                            <span className="text-lg font-semibold text-white ml-2">
                                ${signal.entry_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400">Stop Loss:</span>
                            <span className="text-lg font-semibold text-red-400 ml-2">
                                ${signal.stop_loss.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400">Take Profit:</span>
                            <span className="text-lg font-semibold text-green-400 ml-2">
                                ${signal.take_profit.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Right: Metrics */}
                    <div className="space-y-2">
                        <div>
                            <span className="text-xs text-gray-400">Confidence:</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-500"
                                        style={{ width: `${signal.confidence}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-cyan-400">{signal.confidence}%</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400">Risk/Reward:</span>
                            <span className="text-lg font-semibold text-yellow-400 ml-2">
                                1:{signal.risk_reward_ratio.toFixed(1)}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400">Position Size:</span>
                            <span className="text-sm font-semibold text-purple-400">
                                {signal.position_size_percent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom: Actions */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                        Expires in {minutes}m {seconds}s
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDismissed(true)}
                            className="px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition"
                        >
                            Dismiss
                        </button>
                        <button
                            className={`px-6 py-2 text-sm font-semibold ${buttonColor} text-white rounded-lg transition`}
                        >
                            {signal.action === 'BUY' ? 'Accept BUY' : 'Accept SELL'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

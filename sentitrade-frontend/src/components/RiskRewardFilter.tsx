import React from 'react';

interface RiskRewardData {
    ratio: number;
    ratio_display: string;
    risk_amount: number;
    reward_amount: number;
    status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    quality_score: number;
    historical_win_rate: number;
    recommendation: 'ACCEPT' | 'REJECT';
}

interface RiskRewardFilterProps {
    data?: RiskRewardData;
}

export const RiskRewardFilter: React.FC<RiskRewardFilterProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="w-full p-6 bg-slate-800 rounded-lg border border-slate-700 text-center text-gray-500">
                No signal data
            </div>
        );
    }

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'Excellent':
                return 'text-green-400 bg-green-900/20';
            case 'Good':
                return 'text-yellow-400 bg-yellow-900/20';
            case 'Fair':
                return 'text-orange-400 bg-orange-900/20';
            default:
                return 'text-red-400 bg-red-900/20';
        }
    };

    return (
        <div className="w-full bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Risk/Reward Analysis</h2>

            {/* Main Ratio Display */}
            <div className="text-center mb-8 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                <span className="text-sm text-gray-400 block mb-2">Ratio</span>
                <span className="text-5xl font-bold text-cyan-400">{data.ratio_display}</span>
                <span className={`text-sm font-semibold mt-4 inline-block px-4 py-2 rounded ${getStatusColor(data.status)}`}>
                    {data.status}
                </span>
            </div>

            {/* Risk vs Reward Bar */}
            <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-400">Risk</span>
                    <span className="text-sm font-semibold text-green-400">Reward</span>
                </div>
                <div className="flex gap-2 h-8 rounded overflow-hidden">
                    <div
                        className="bg-red-600 flex items-center justify-center text-xs font-bold text-white"
                        style={{ width: `${(data.risk_amount / (data.risk_amount + data.reward_amount)) * 100}%` }}
                    >
                        ${data.risk_amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                    <div
                        className="bg-green-600 flex items-center justify-center text-xs font-bold text-white"
                        style={{ width: `${(data.reward_amount / (data.risk_amount + data.reward_amount)) * 100}%` }}
                    >
                        ${data.reward_amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                </div>
            </div>

            {/* Quality Score */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-xs text-gray-400 block mb-2">Quality Score</span>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-500"
                                style={{ width: `${data.quality_score}%` }}
                            />
                        </div>
                        <span className="text-lg font-bold text-yellow-400">{data.quality_score}%</span>
                    </div>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-xs text-gray-400 block mb-2">Historical Win Rate</span>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-500"
                                style={{ width: `${data.historical_win_rate}%` }}
                            />
                        </div>
                        <span className="text-lg font-bold text-cyan-400">{data.historical_win_rate.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            {/* Recommendation */}
            <div className={`text-center p-4 rounded-lg border-2 ${data.recommendation === 'ACCEPT'
                    ? 'border-green-600 bg-green-900/20'
                    : 'border-red-600 bg-red-900/20'
                }`}>
                <span className={`text-lg font-bold ${data.recommendation === 'ACCEPT' ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {data.recommendation === 'ACCEPT' ? '✅ ACCEPT Signal' : '❌ REJECT Signal'}
                </span>
            </div>
        </div>
    );
};

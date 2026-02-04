import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { createChart, ColorType } from 'lightweight-charts';

interface BacktestStats {
    total_return_pct: number;
    win_rate: number;
    var_95: number;
    final_equity: number;
    trade_count: number;
    equity_curve: { time: string; value: number }[];
}

export const BacktestResults: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<BacktestStats | null>(null);
    const [days, setDays] = useState(180);

    const chartContainerRef = React.useRef<HTMLDivElement>(null);

    const runBacktest = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/backtest/run', {
                asset: 'BTC-USD',
                days: days,
                capital: 10000
            });
            setStats(response.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Render chart effect
    React.useEffect(() => {
        if (stats && chartContainerRef.current) {
            const chart = createChart(chartContainerRef.current, {
                layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#9ca3af' },
                grid: { vertLines: { color: '#334155' }, horzLines: { color: '#334155' } },
                width: chartContainerRef.current.clientWidth,
                height: 200,
            }) as any;

            const areaSeries = chart.addAreaSeries({
                lineColor: '#10b981', topColor: 'rgba(16, 185, 129, 0.4)', bottomColor: 'rgba(16, 185, 129, 0.01)',
            });

            const data = stats.equity_curve.map(d => ({
                time: d.time.split('T')[0],
                value: d.value
            }));

            // Deduplicate per day for lightweight-charts strictness
            const uniqueData = Array.from(new Map(data.map(item => [item.time, item])).values());

            areaSeries.setData(uniqueData as any);
            chart.timeScale().fitContent();

            return () => chart.remove();
        }
    }, [stats]);

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-2">⏳</span> Strategy Backtester
                </h2>
                <div className="flex gap-2">
                    <select
                        className="bg-slate-700 text-white rounded px-2 py-1 text-sm border border-slate-600"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                    >
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                        <option value="365">1 Year</option>
                    </select>
                    <button
                        onClick={runBacktest}
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1 rounded text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Running Simulation...' : 'Run Simulation'}
                    </button>
                </div>
            </div>

            {stats ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-700/50 p-3 rounded border border-slate-600">
                            <div className="text-xs text-slate-400">Total Return</div>
                            <div className={`text-xl font-mono font-bold ${stats.total_return_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stats.total_return_pct > 0 ? '+' : ''}{stats.total_return_pct}%
                            </div>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded border border-slate-600">
                            <div className="text-xs text-slate-400">Win Rate</div>
                            <div className="text-xl font-mono font-bold text-cyan-400">{stats.win_rate}%</div>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded border border-slate-600">
                            <div className="text-xs text-slate-400">Monte Carlo VaR (95%)</div>
                            <div className="text-xl font-mono font-bold text-red-400">-{stats.var_95}%</div>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded border border-slate-600">
                            <div className="text-xs text-slate-400">Final Equity</div>
                            <div className="text-xl font-mono font-bold text-white">${stats.final_equity.toLocaleString()}</div>
                        </div>
                    </div>

                    <div ref={chartContainerRef} className="w-full h-[200px] border border-slate-700 rounded bg-slate-900/50"></div>
                </div>
            ) : (
                <div className="text-center py-10 text-slate-500 bg-slate-700/20 rounded border border-dashed border-slate-700">
                    <p>Run a simulation to test the Sentiment Strategy against historical data.</p>
                </div>
            )}
        </div>
    );
};

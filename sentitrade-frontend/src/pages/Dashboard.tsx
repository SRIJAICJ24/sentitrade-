import React from 'react';

import { SentimentGauge } from '../components/SentimentGauge';
import { TradingSignal } from '../components/TradingSignal';
import { GlobalSearch } from '../components/dashboard/GlobalSearch';
import { PriceChart } from '../components/PriceChart';
import { WhaleTracker } from '../components/WhaleTracker';
import { DivergenceDetector } from '../components/DivergenceDetector';

import { SentiQuantFeed } from '../components/dashboard/SentiQuantFeed';
import { WealthVault } from '../components/dashboard/WealthVault';
import { SmartWishlist } from '../components/dashboard/SmartWishlist';
import GuardianStatus from '../components/dashboard/GuardianStatus';
import { BacktestResults } from '../components/dashboard/BacktestResults';
import { PatternRadar } from '../components/dashboard/PatternRadar';
import { XAIAdvisor } from '../components/XAIAdvisor';
import { useMarketStore } from '../store/marketStore';
import { getHistory } from '../api/dataService';
import { TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { activeAsset } = useMarketStore();

    const [chartData, setChartData] = React.useState<any[]>([]);
    const [loadingChart, setLoadingChart] = React.useState(false);

    // Fetch Chart Data on Asset Change (Using Sovereign Data Pipeline)
    React.useEffect(() => {
        const fetchChartData = async () => {
            setLoadingChart(true);
            try {
                // Use new Sovereign Data Pipeline endpoint
                const data = await getHistory(activeAsset, 30); // 30 days for better visualization
                if (data && data.length > 0) {
                    // Add sentiment placeholder to each candle (required by PriceChart)
                    const enrichedData = data.map(candle => ({
                        ...candle,
                        sentiment_score: 50 + Math.random() * 30, // Mock sentiment for now
                    }));
                    setChartData(enrichedData);
                } else {
                    setChartData([]);
                }
            } catch (err) {
                console.error("Failed to fetch chart", err);
                setChartData([]);
            } finally {
                setLoadingChart(false);
            }
        };

        fetchChartData();
    }, [activeAsset]);

    return (
        <div className="p-4 md:p-8 pt-24 pb-32 max-w-[1600px] mx-auto space-y-8">
            {/* Header Section */}
            <div className="grid grid-cols-12 items-center gap-4 mb-8">
                {/* Brand / Title (Cols 1-3) */}
                <div className="col-span-12 md:col-span-3 flex flex-col">
                    <h1 className="text-3xl font-extrabold text-white tracking-tighter font-['Urbanist']">
                        MISSION CONTROL
                    </h1>
                    <span className="text-[10px] tracking-[0.2em] text-neon uppercase font-mono">
                        SentiTrade Pro v2.0
                    </span>
                </div>

                {/* Global Search (Cols 4-9) - Centered & Dominant */}
                <div className="col-span-12 md:col-span-6 relative z-50">
                    <GlobalSearch />
                </div>

                {/* Sovereign Status & Asset (Cols 10-12) - Right Utils */}
                <div className="col-span-12 md:col-span-3 flex flex-col items-end gap-2">
                    {/* Sovereign Status Pill */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-emerald-500/30 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 tracking-wider font-mono">
                            LOCAL NODE: ACTIVE
                        </span>
                    </div>

                    {/* Active Asset Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-obsidian-card border border-obsidian-border rounded text-xs text-slate-400">
                        <span>Viewing:</span>
                        <span className="text-neon font-bold">{activeAsset}</span>
                    </div>
                </div>
            </div>

            <div className="relative z-40">
                <TradingSignal />
            </div>

            {/* 2. MAIN ANALYTICS GRID (12 Columns) */}
            <div className="grid grid-cols-12 gap-6">

                {/* LEFT COLUMN: Deep Analytics (8 Columns) */}
                <div className="col-span-12 lg:col-span-8 space-y-6">

                    {/* Primary Chart Card */}
                    <div className="bg-obsidian-card border border-obsidian-border rounded-xl p-1 shadow-2xl overflow-hidden group hover:border-slate-700 transition-colors">
                        <div className="bg-black/40 p-3 border-b border-obsidian-border flex justify-between items-center">
                            <h3 className="font-bold text-white tracking-tight flex items-center gap-2">
                                <TrendingUp size={16} className="text-neon" />
                                PRICE ACTION <span className="text-slate-600">v/s</span> SENTIMENT
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] text-emerald-400 font-mono uppercase">Live Feed</span>
                            </div>
                        </div>
                        <div className="p-4 h-[450px]">
                            <PriceChart data={chartData} loading={loadingChart} />
                        </div>
                    </div>

                    {/* Secondary Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SentimentGauge />
                        <DivergenceDetector />
                    </div>

                    <WealthVault />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BacktestResults />
                        <PatternRadar />
                    </div>
                </div>

                {/* RIGHT COLUMN: Intelligence & Watchlist (4 Columns) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="sticky top-6 space-y-6">
                        <div className="bg-obsidian-card border border-obsidian-border rounded-xl p-4 min-h-[300px]">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Smart Watchlist</h3>
                            <SmartWishlist />
                        </div>

                        <GuardianStatus />

                        <SentiQuantFeed />

                        <div className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border border-indigo-500/20 rounded-xl p-4">
                            <WhaleTracker />
                        </div>

                        <XAIAdvisor />
                    </div>
                </div>
            </div>
        </div>
    );
}

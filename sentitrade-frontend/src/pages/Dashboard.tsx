import React from 'react';

import { SentimentGauge } from '../components/SentimentGauge';
import { TradingSignal } from '../components/TradingSignal';
import { GlobalSearch } from '../components/dashboard/GlobalSearch';
import { GlobalRadarView } from './GlobalRadarView';
import { PortfolioView } from './PortfolioView';
import { SovereignFooterTicker } from '../components/dashboard/SovereignFooterTicker';

import { useMarketStore } from '../store/marketStore';
import { getHistory } from '../api/dataService';
import { TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { activeAsset } = useMarketStore();

    const [chartData, setChartData] = React.useState<any[]>([]);
    const [loadingChart, setLoadingChart] = React.useState(false);
    const [mapView, setMapView] = React.useState<'globe' | 'tactical'>('globe');

    // Fetch Chart Data on Asset Change (Using Sovereign Data Pipeline)
    React.useEffect(() => {
        if (!activeAsset) {
            setChartData([]);
            return;
        }

        const fetchChartData = async () => {
            setLoadingChart(true);
            try {
                // Fetch explicitly supported 30 days of data to prevent API rejection
                const data = await getHistory(activeAsset, 30);
                if (data && data.length > 0) {
                    // Sort data chronologically to calculate accurate momentum indicators
                    const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                    
                    // 14-Period RSI Calculation for "Accurate Momentum Sentiment"
                    const rsiPeriod = 14;
                    let gains = 0;
                    let losses = 0;
                    let avgGain = 0;
                    let avgLoss = 0;
                    
                    const enrichedData = sortedData.map((candle, index) => {
                        let currentRSI = 50; // Default neutral

                        if (index > 0) {
                            const change = candle.close - sortedData[index - 1].close;
                            const gain = change > 0 ? change : 0;
                            const loss = change < 0 ? Math.abs(change) : 0;

                            if (index < rsiPeriod) {
                                gains += gain;
                                losses += loss;
                            } else if (index === rsiPeriod) {
                                avgGain = gains / rsiPeriod;
                                avgLoss = losses / rsiPeriod;
                                const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
                                currentRSI = 100 - (100 / (1 + rs));
                            } else {
                                avgGain = ((avgGain * (rsiPeriod - 1)) + gain) / rsiPeriod;
                                avgLoss = ((avgLoss * (rsiPeriod - 1)) + loss) / rsiPeriod;
                                const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
                                currentRSI = 100 - (100 / (1 + rs));
                            }
                        }

                        return {
                            ...candle,
                            // Assign Mathematical RSI as Sentiment (0-100 scale)
                            sentiment_score: Math.min(100, Math.max(0, currentRSI)),
                        };
                    });

                    // Only take the last 30 days to display if we requested 60 for calculation buffer
                    const displayData = enrichedData.slice(-30);
                    setChartData(displayData);
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
        <div className="min-h-screen bg-black">
            <div className="p-4 md:p-6 lg:p-8 pt-20 md:pt-24 pb-32 max-w-[1600px] mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    {/* Brand / Title */}
                    <div className="flex flex-col shrink-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-widest font-mono">
                            SOVEREIGN COMMAND CENTER
                        </h1>
                        <span className="text-[10px] tracking-[0.2em] text-neon uppercase font-mono animate-pulse drop-shadow-[0_0_8px_#d6ff3f]">
                            SentiTrade HUD v3.0 ONLINE
                        </span>
                    </div>

                    {/* Global Search - centered */}
                    <div className="flex-1 relative z-50 max-w-2xl mx-auto w-full">
                        <GlobalSearch />
                    </div>

                    {/* Sovereign Status & Asset - right */}
                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                        {/* Sovereign Status Pill */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#262626] rounded-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 tracking-widest font-mono">
                                UPLINK: STABLE
                            </span>
                        </div>

                        {/* Active Asset Badge */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#121212] border border-[#262626] rounded-sm text-xs text-slate-400 font-mono tracking-wider">
                            <span>TARGET:</span>
                            <span className="text-neon font-bold drop-shadow-[0_0_5px_#d6ff3f]">{activeAsset || 'GLOBAL_SEARCH'}</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-40 mb-6">
                    <TradingSignal />
                </div>

                {/* Application State Router */}
                {!activeAsset ? (
                    <GlobalRadarView />
                ) : (
                    <PortfolioView chartData={chartData} loadingChart={loadingChart} />
                )}
            </div>
            
            <SovereignFooterTicker />
        </div>
    );
}

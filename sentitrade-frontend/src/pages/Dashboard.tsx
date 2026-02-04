
import { Layout } from '../components/Layout';
import { SentimentGauge } from '../components/SentimentGauge';
import { TradingSignal } from '../components/TradingSignal';
import { PriceChart } from '../components/PriceChart';
import { WhaleTracker } from '../components/WhaleTracker';
import { DivergenceDetector } from '../components/DivergenceDetector';
import { PositionCalculator } from '../components/PositionCalculator';
import { RiskRewardFilter } from '../components/RiskRewardFilter';
import { AlertManager } from '../components/AlertManager';
import { SentiQuantConsole } from '../components/SentiQuantConsole';
import MarketWindow from '../components/dashboard/MarketWindow';
import PortfolioTable from '../components/dashboard/PortfolioTable';
import GuardianStatus from '../components/dashboard/GuardianStatus';
import GuardianSettings from '../components/dashboard/GuardianSettings';
import { PatternRadar } from '../components/dashboard/PatternRadar';
import { BacktestResults } from '../components/dashboard/BacktestResults';


export default function Dashboard() {
    // Mock chart data for visualization
    const mockChartData = Array.from({ length: 100 }, (_, i) => ({
        time: new Date(Date.now() - (100 - i) * 3600 * 1000).toISOString(),
        open: 40000 + Math.random() * 1000,
        high: 41000 + Math.random() * 1000,
        low: 39000 + Math.random() * 1000,
        close: 40500 + Math.random() * 1000,
        volume: 1000 + Math.random() * 5000,
        sentiment_score: 50 + Math.random() * 50
    }));

    return (
        <Layout>
            <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-white">SentiTrade Pro</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-sm text-emerald-400">FinBERT Active</span>
                        </div>
                    </div>

                    {/* Trading Signal Alert */}
                    <TradingSignal />

                    {/* Main Grid - 2 columns on desktop, 1 on mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <SentimentGauge />
                            <DivergenceDetector />
                            <PositionCalculator />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <PriceChart data={mockChartData} />
                            <WhaleTracker />
                        </div>
                    </div>

                    {/* Portfolio Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SentimentGauge />
                                <PatternRadar />
                            </div>
                            <PortfolioTable />
                        </div>
                        <div className="h-96">
                            <PriceChart data={mockChartData} />
                            <MarketWindow />
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RiskRewardFilter data={{
                            ratio: 3.2,
                            ratio_display: "1:3.2",
                            risk_amount: 500,
                            reward_amount: 1600,
                            status: "Excellent",
                            quality_score: 88,
                            historical_win_rate: 65.4,
                            recommendation: "ACCEPT"
                        }} />
                        <AlertManager />
                    </div>

                    <BacktestResults />
                </div>

                {/* Side Panel - Senti-Quant Console */}
                <div className="hidden xl:block w-96 shrink-0">
                    <div className="sticky top-6 space-y-6">
                        <GuardianStatus />
                        <GuardianSettings />
                        <SentiQuantConsole />
                    </div>
                </div>
            </div>
        </Layout>
    );
}


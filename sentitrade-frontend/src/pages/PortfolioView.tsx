import React from 'react';
import { PriceChart } from '../components/PriceChart';
import { DivergenceDetector } from '../components/DivergenceDetector';
import { WealthVault } from '../components/dashboard/WealthVault';
import { IntelligenceBriefs } from '../components/dashboard/IntelligenceBriefs';
import { WhaleTracker } from '../components/WhaleTracker';
import { SentiQuantFeed } from '../components/dashboard/SentiQuantFeed';
import { XAIAdvisor } from '../components/XAIAdvisor';
import { TrendingGallery } from '../components/TrendingGallery';
import { TrendingUp, Target } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';

export const PortfolioView: React.FC<{ chartData: any[], loadingChart: boolean }> = ({ chartData, loadingChart }) => {
    const { activeAsset } = useMarketStore();

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Context Header */}
            <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-widest font-mono uppercase">TACTICAL LOCK: {activeAsset}</h2>
                        <p className="text-xs text-slate-400">All feeds, intelligence agents, and divergence tracking algorithms are now scoped specifically to this asset.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN: Deep Analytics */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* True Data Price Chart */}
                    <div className="bg-obsidian-card border border-obsidian-border rounded-xl p-1 shadow-2xl overflow-hidden group hover:border-slate-700 transition-colors">
                        <div className="bg-black/40 p-3 border-b border-obsidian-border flex justify-between items-center">
                            <h3 className="font-bold text-white tracking-tight flex items-center gap-2 text-sm uppercase">
                                <TrendingUp size={16} className="text-neon" />
                                {activeAsset} TRUE DATA vs SOCIAL BUZZ
                            </h3>
                            <span className="text-[10px] px-2 py-1 bg-neon/10 text-neon rounded font-mono uppercase">Proprietary Overlay</span>
                        </div>
                        <div className="p-4 h-[400px]">
                            <PriceChart data={chartData} loading={loadingChart} showSentimentOverlay={true} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DivergenceDetector />
                        {/* Placeholder for specific components that would go here */}
                         <div className="bg-obsidian-card border border-obsidian-border rounded-xl p-4 font-mono text-slate-500 text-xs flex items-center justify-center text-center">
                            Awaiting external portfolio injection matrix...
                        </div>
                    </div>

                    <WealthVault />

                </div>

                {/* RIGHT COLUMN: Scoped Intelligence */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="h-[400px]">
                        <IntelligenceBriefs />
                    </div>

                    <SentiQuantFeed />

                    <div className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border border-indigo-500/20 rounded-xl p-4">
                        <WhaleTracker />
                    </div>
                    
                    <TrendingGallery />

                    <XAIAdvisor />
                </div>
            </div>
        </div>
    );
};

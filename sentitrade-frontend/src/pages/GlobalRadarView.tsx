import React from 'react';
import { SentimentGlobe } from '../components/dashboard/SentimentGlobe';
import { GeographicPulseWidget } from '../components/dashboard/GeographicPulseWidget';
import { SignalFeedSidebar } from '../components/dashboard/SignalFeedSidebar';
import { Network, Globe2, Activity, RadioTower } from 'lucide-react';

export const GlobalRadarView: React.FC = () => {
    const [mapView, setMapView] = React.useState<'globe' | 'tactical'>('globe');

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Context Header */}
            <div className="bg-[#121212] border border-[#262626] rounded-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe2 className="text-[#d6ff3f]" />
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-widest font-mono">GLOBAL OBSERVER ONLINE</h2>
                        <p className="text-[10px] uppercase tracking-widest text-[#475569] font-mono mt-1">
                            Awaiting tactical target selection to initialize sovereign portfolio lock.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 3D Map Convergence Area - 8 Cols */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-[#121212] border border-[#262626] rounded-sm p-1 overflow-hidden h-[600px] flex flex-col relative focus-within:border-slate-700 transition-colors">
                        
                        <div className="bg-[#000000]/80 p-3 flex justify-between items-center z-10">
                            <h3 className="font-bold text-white tracking-tight flex items-center gap-2 text-xs font-mono uppercase">
                                <Network size={14} className="text-[#a855f7]" />
                                Geospacial Sentiment & Flow Arc Array
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d6ff3f] animate-pulse"></span>
                                <span className="text-[9px] text-[#d6ff3f] font-mono uppercase tracking-widest shadow-[0_0_8px_#d6ff3f]">Data Sync Active</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full relative">
                            <SentimentGlobe onAssetClick={() => {}} />
                        </div>
                    </div>
                </div>

                {/* Macro Infrastructure - 4 Cols */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Signal Feed */}
                    <div className="bg-[#121212] border border-[#262626] rounded-sm h-[320px] shadow-2xl overflow-hidden bg-opacity-70">
                        <SignalFeedSidebar />
                    </div>

                    {/* Gen Pulse Widget */}
                    <div className="bg-[#121212] border border-[#262626] rounded-sm h-[256px] shadow-2xl flex flex-col items-start p-4">
                        <h3 className="font-bold text-white tracking-tight flex items-center gap-2 text-xs mb-4 font-mono uppercase w-full border-b border-[#262626] pb-2">
                            <RadioTower size={14} className="text-[#d6ff3f]" />
                            REGIONAL VOLATILITY MATRIX
                        </h3>
                        <div className="flex-1 w-full flex items-center">
                            <GeographicPulseWidget />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

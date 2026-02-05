import React from 'react';
import { Target, TrendingDown } from 'lucide-react';

interface WishlistItem {
    id: number;
    symbol: string;
    name: string;
    current_price: number;
    budget: number;
    prediction_hours?: number;
}

const mockWishlist: WishlistItem[] = [
    { id: 1, symbol: 'TITAN', name: 'Titan Company', current_price: 3650, budget: 3500, prediction_hours: 48 },
    { id: 2, symbol: 'ADANIENT', name: 'Adani Enterprises', current_price: 3120, budget: 2800 },
    { id: 3, symbol: 'TATASTEEL', name: 'Tata Steel', current_price: 142, budget: 135, prediction_hours: 12 },
];

export const SmartWishlist: React.FC = () => {
    return (
        <div className="bg-obsidian-card border border-obsidian-border rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target size={20} className="text-neon" />
                    <h3 className="font-bold text-white tracking-wide">SMART WISHLIST</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">BUDGET TRACKER</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {mockWishlist.map((item) => {
                    const diff = ((item.current_price - item.budget) / item.current_price) * 100;
                    return (
                        <div key={item.id} className="p-3 bg-black/40 border border-obsidian-border rounded-lg hover:border-neon/30 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold text-white text-sm group-hover:text-neon transition-colors">{item.symbol}</div>
                                    <div className="text-[10px] text-slate-500">{item.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-slate-300">₹{item.current_price}</div>
                                    <div className="text-[10px] text-slate-500">Target: ₹{item.budget}</div>
                                </div>
                            </div>

                            {/* Budget Progress Bar */}
                            <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                                <div
                                    className="absolute top-0 right-0 h-full bg-slate-600 w-full"
                                    style={{ transform: `translateX(-${Math.max(0, diff)}%)` }}
                                />
                                <div className="absolute top-0 left-0 h-full w-1 bg-neon z-10" style={{ left: `${100 - Math.max(0, diff)}%` }} />
                            </div>

                            {/* Prediction Badge */}
                            {item.prediction_hours && (
                                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neon/10 border border-neon/20 rounded text-[10px] text-neon animate-pulse">
                                    <TrendingDown size={12} />
                                    <span>AI Signal: Hits budget in ~{item.prediction_hours}h</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button className="w-full mt-4 py-2 border border-dashed border-slate-700 text-slate-500 text-xs rounded hover:border-neon hover:text-neon transition-all">
                + Add Asset to Watch
            </button>
        </div>
    );
};

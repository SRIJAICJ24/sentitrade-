import React from 'react';
import { Flame, MessageCircle, Repeat2, Heart, ExternalLink } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';

const mockTrendingPosts = [
    {
        id: 1,
        author: '@DeFi_Whale',
        handle: 'DeFi_Whale',
        content: 'Massive accumulation occurring on $BTC right now. The on-chain metrics suggest institutions are sweeping the floor. Retail is asleep.',
        metrics: { comments: 342, retweets: 1205, likes: 4500 },
        time: '1h ago',
        sentiment: 'bullish'
    },
    {
        id: 2,
        author: 'r/WallStreetBets',
        handle: 'wsb_mod',
        content: 'Oil futures are going parabolic. If the Suez disruption holds, we are looking at $120/barrel minimum. Positions: Calls on USO.',
        metrics: { comments: 1200, retweets: 85, likes: 3200 },
        time: '2h ago',
        sentiment: 'bullish'
    },
    {
        id: 3,
        author: 'Macro Watch',
        handle: 'macro_watch_ai',
        content: 'VIX spiking to 28. Market pricing in significant rate hike friction. Extreme vulnerability across highly leveraged tech stocks (NVDA, TSLA).',
        metrics: { comments: 84, retweets: 320, likes: 950 },
        time: '3h ago',
        sentiment: 'bearish'
    }
];

export const TrendingGallery: React.FC = () => {
    const { activeAsset } = useMarketStore();
    
    // Filter logic for Portfolio mode
    const displayPosts = activeAsset 
        ? mockTrendingPosts.filter(p => p.content.includes(activeAsset) || p.content.includes('BTC') || p.content.includes('USO')) // Soft filter for demo
        : mockTrendingPosts;

    return (
        <div className="w-full bg-obsidian-card rounded-xl border border-obsidian-border shadow-2xl h-[450px] flex flex-col group hover:border-slate-700 transition overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame size={16} className="text-orange-500 animate-pulse" />
                    <h2 className="text-sm font-bold text-white tracking-widest uppercase">
                        TRENDING INTELLIGENCE
                    </h2>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">LAST 4H</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {displayPosts.map(post => (
                    <div key={post.id} className="bg-black/30 border border-white/5 rounded-lg p-4 hover:border-orange-500/30 transition shadow-inner">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    <span className="text-[10px] font-bold text-slate-400">{post.author.charAt(0)}</span>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">{post.author}</div>
                                    <div className="text-[9px] text-slate-500 font-mono">@{post.handle}</div>
                                </div>
                            </div>
                            <ExternalLink size={12} className="text-slate-600 hover:text-white cursor-pointer" />
                        </div>
                        
                        <p className="text-sm text-slate-300 font-medium mb-3 leading-relaxed">
                            {post.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                            <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition">
                                <MessageCircle size={12} /> {post.metrics.comments}
                            </div>
                            <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition">
                                <Repeat2 size={12} /> {post.metrics.retweets}
                            </div>
                            <div className="flex items-center gap-1 hover:text-red-400 cursor-pointer transition">
                                <Heart size={12} /> {post.metrics.likes}
                            </div>
                            <div className={`ml-auto px-2 py-0.5 rounded text-[9px] font-bold uppercase ${post.sentiment === 'bullish' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                FINBERT: {post.sentiment}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="p-3 bg-black/60 border-t border-white/5 text-center">
                <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                    Aggregating X (Twitter) • Reddit • StockTwits
                </span>
            </div>
        </div>
    );
};

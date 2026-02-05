import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Repeat, Heart, Share2, Zap } from 'lucide-react';

interface FeedItem {
    id: string;
    source: 'Twitter' | 'Reddit' | 'Bloomberg' | 'Senti-Core';
    handle: string;
    content: string;
    sentiment: number; // 0-100
    timestamp: string;
    engagement: {
        likes: number;
        reposts: number;
    };
    isDivergence: boolean;
}

const mockFeed: FeedItem[] = [
    {
        id: '1',
        source: 'Senti-Core',
        handle: '@Senti_AI_Node',
        content: '🚨 DIVERGENCE ALERT: Reliance Industries price flat (0.00%) but Institutional Sentiment spiked +15% in last hour. Accumulation detected.',
        sentiment: 85,
        timestamp: '2m ago',
        engagement: { likes: 124, reposts: 45 },
        isDivergence: true
    },
    {
        id: '2',
        source: 'Twitter',
        handle: '@BullWhale_IND',
        content: 'Nifty crossing 22k is inevitable. The put-call ratio is screaming bullish. Loading up on calls right now. #Nifty50 #BullRun',
        sentiment: 78,
        timestamp: '15m ago',
        engagement: { likes: 892, reposts: 210 },
        isDivergence: false
    },
    {
        id: '3',
        source: 'Bloomberg',
        handle: '@Markets',
        content: 'RBI Governor hints at rate pause in upcoming MPC meeting. Banking sector reacts positively.',
        sentiment: 60,
        timestamp: '42m ago',
        engagement: { likes: 1500, reposts: 560 },
        isDivergence: false
    },
];

export const SentiQuantFeed: React.FC = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} className="text-neon" />
                    Live Sentiment Stream
                </h3>
                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 animate-pulse font-bold">LIVE</span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                <AnimatePresence>
                    {mockFeed.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border backdrop-blur-sm relative overflow-hidden group
                                ${item.isDivergence
                                    ? 'bg-neon/5 border-neon/50 shadow-[0_0_15px_rgba(214,255,63,0.1)]'
                                    : 'bg-obsidian-card border-obsidian-border hover:border-slate-700'
                                }
                            `}
                        >
                            {/* Divergence Strip */}
                            {item.isDivergence && (
                                <div className="absolute top-0 right-0 px-2 py-1 bg-neon text-black text-[10px] font-bold uppercase tracking-widest">
                                    Alpha Signal
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                        ${item.source === 'Senti-Core' ? 'bg-black border border-neon text-neon' : 'bg-slate-800 text-slate-300'}
                                    `}>
                                        {item.source[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold text-sm ${item.isDivergence ? 'text-white' : 'text-slate-200'}`}>
                                                {item.handle}
                                            </span>
                                            <span className="text-xs text-slate-500">• {item.timestamp}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 tracking-wide uppercase font-mono">{item.source}</span>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold font-mono
                                    ${item.sentiment >= 75 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                        item.sentiment <= 25 ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'}
                                `}>
                                    SCORE: {item.sentiment}
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-sm text-slate-300 mb-4 leading-relaxed font-medium">
                                {item.content}
                            </p>

                            {/* Footer Actions */}
                            <div className="flex items-center gap-6 text-slate-500">
                                <button className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">
                                    <MessageSquare size={14} />
                                    <span>Reply</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-xs hover:text-emerald-500 transition-colors">
                                    <Repeat size={14} />
                                    <span>{item.engagement.reposts}</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-xs hover:text-pink-500 transition-colors">
                                    <Heart size={14} />
                                    <span>{item.engagement.likes}</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-xs ml-auto hover:text-neon transition-colors">
                                    <Share2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

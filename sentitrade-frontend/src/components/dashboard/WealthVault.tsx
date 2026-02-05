import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { getQuote } from '../../api/dataService';

interface PortfolioItem {
    id: number;
    ticker: string;
    quantity: number;
    buy_price: number;
    current_price: number;
    pnl: number;
    pnl_percent: number;
    sentiment_score: number;
    history: number[]; // For sparklines
}

// Initial portfolio holdings (prices will be updated from API)
const initialHoldings: PortfolioItem[] = [
    {
        id: 1, ticker: 'BTC-USD', quantity: 0.5, buy_price: 65000, current_price: 98922, pnl: 16961,
        pnl_percent: 52.18, sentiment_score: 85,
        history: [85, 88, 92, 90, 85, 78, 85, 88, 92, 95]
    },
    {
        id: 2, ticker: 'RELIANCE', quantity: 100, buy_price: 2400, current_price: 2980, pnl: 58000,
        pnl_percent: 24.16, sentiment_score: 72,
        history: [65, 68, 70, 72, 75, 72, 70, 72, 72, 71]
    },
    {
        id: 3, ticker: 'HDFCBANK', quantity: 50, buy_price: 1650, current_price: 1580, pnl: -3500,
        pnl_percent: -4.24, sentiment_score: 35,
        history: [45, 42, 40, 38, 35, 32, 28, 30, 32, 35]
    },
];

export const WealthVault: React.FC = () => {
    const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(initialHoldings);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch live prices on mount and when currency changes
    useEffect(() => {
        const fetchLivePrices = async () => {
            setIsLoading(true);
            try {
                const updatedItems = await Promise.all(
                    portfolioItems.map(async (item) => {
                        const quote = await getQuote(item.ticker);
                        if (quote && quote.price > 0 && !quote.is_mock) {
                            const newPrice = quote.price;
                            const pnl = (newPrice - item.buy_price) * item.quantity;
                            const pnlPercent = ((newPrice - item.buy_price) / item.buy_price) * 100;
                            return {
                                ...item,
                                current_price: newPrice,
                                pnl: pnl,
                                pnl_percent: pnlPercent,
                                sentiment_score: quote.sentiment * 100, // Convert 0-1 to 0-100
                            };
                        }
                        return item;
                    })
                );
                setPortfolioItems(updatedItems);
            } catch (err) {
                console.error('[WealthVault] Failed to fetch live prices:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLivePrices();
        // Refresh every 30 seconds
        const interval = setInterval(fetchLivePrices, 30000);
        return () => clearInterval(interval);
    }, []);

    // Simple Sparkline Component
    const Sparkline = ({ data, color }: { data: number[], color: string }) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const height = 24;
        const width = 60;

        const path = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        return (
            <svg width={width} height={height} className="overflow-visible">
                <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    return (
        <div className="bg-obsidian-card border border-obsidian-border rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-obsidian-border flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-neon/10 rounded-lg">
                        <DollarSign className="text-neon" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-white tracking-wide font-['Urbanist']">WEALTH VAULT</h2>
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                            {isLoading ? 'SYNCING...' : 'PORTFOLIO HEALTH MONITOR'}
                        </span>
                    </div>
                </div>

                {/* Currency Toggle */}
                <div className="flex bg-black border border-obsidian-border rounded p-1">
                    <button
                        onClick={() => setCurrency('USD')}
                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all tracking-wider ${currency === 'USD' ? 'bg-neon text-black' : 'text-slate-500 hover:text-white'}`}
                    >
                        USD
                    </button>
                    <button
                        onClick={() => setCurrency('INR')}
                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all tracking-wider ${currency === 'INR' ? 'bg-neon text-black' : 'text-slate-500 hover:text-white'}`}
                    >
                        INR
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-900/50 text-[10px] text-slate-500 uppercase font-mono tracking-widest text-left">
                        <tr>
                            <th className="px-6 py-4">Asset</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">P&L</th>
                            <th className="px-6 py-4">Trend (24H)</th>
                            <th className="px-6 py-4">Sentiment Health</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-obsidian-border text-sm">
                        {portfolioItems.map((item) => {
                            const isToxic = item.sentiment_score < 40;
                            const sparkColor = item.history[item.history.length - 1] > item.history[0] ? '#10b981' : '#ef4444';

                            return (
                                <tr key={item.id} className={`group hover:bg-white/5 transition-colors ${isToxic ? 'bg-red-500/5' : ''}`}>
                                    <td className="px-6 py-4 font-bold text-white group-hover:text-neon transition-colors font-mono">
                                        {item.ticker}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 font-mono tracking-tight">
                                        {formatCurrency(currency === 'INR' ? item.current_price * 83 : item.current_price, currency)}
                                    </td>
                                    <td className={`px-6 py-4 font-mono font-bold ${item.pnl >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                        <div className="flex items-center gap-1">
                                            {item.pnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {formatNumber(item.pnl_percent)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                                            <Sparkline data={item.history} color={sparkColor} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isToxic ? 'bg-red-500' : 'bg-neon'}`}
                                                style={{ width: `${item.sentiment_score}%` }}
                                            />
                                        </div>
                                        <div className="mt-1 text-[10px] text-slate-500 flex justify-between font-mono">
                                            <span>{item.sentiment_score}/100</span>
                                            {isToxic && <span className="text-red-500 font-bold tracking-wider">TOXIC</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isToxic ? (
                                            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-[0_0_0_rgba(255,77,77,0)] hover:shadow-[0_0_15px_rgba(255,77,77,0.5)] animate-pulse">
                                                <Shield size={12} />
                                                RESCUE
                                            </button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold border border-emerald-500/20 tracking-wider">
                                                <Activity size={12} />
                                                SECURE
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

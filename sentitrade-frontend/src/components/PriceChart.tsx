import React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { useMarketStore } from '../store/marketStore';

interface PriceChartProps {
    data?: any[]; // Kept for backwards compatibility prop signatures
    loading?: boolean;
    showSentimentOverlay?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({ loading }) => {
    const { activeAsset } = useMarketStore();

    // Map internal tickers to TradingView symbols
    const mapToTradingViewSymbol = (ticker: string) => {
        if (!ticker) return "BINANCE:BTCUSDT";
        const upper = ticker.toUpperCase();
        
        // India NSE
        if (upper.endsWith('.NS')) {
            return `NSE:${upper.replace('.NS', '')}`;
        }
        // India BSE
        if (upper.endsWith('.BO')) {
            return `BSE:${upper.replace('.BO', '')}`;
        }
        
        // Crypto
        const cryptoList = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA'];
        if (upper.includes('-USD') || cryptoList.some(c => upper === c)) {
            const sym = upper.replace('-USD', '');
            return `BINANCE:${sym}USDT`;
        }
        
        return upper;
    };

    const tvSymbol = mapToTradingViewSymbol(activeAsset || 'BTC');

    return (
        <div className="relative w-full h-[450px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-obsidian/50 z-10 backdrop-blur-sm">
                    <div className="animate-spin-slow w-12 h-12 border-4 border-neon border-t-transparent rounded-full shadow-[0_0_15px_#d6ff3f]"></div>
                </div>
            )}
            
            <div className="w-full h-full rounded-lg overflow-hidden border border-obsidian-border bg-[#0a0a0a]">
                <AdvancedRealTimeChart 
                    key={tvSymbol}
                    symbol={tvSymbol}
                    theme="dark"
                    autosize={true}
                    interval="D"
                    timezone="Etc/UTC"
                    style="1"
                    locale="en"
                    enable_publishing={false}
                    hide_top_toolbar={false}
                    hide_legend={false}
                    save_image={false}
                    allow_symbol_change={false}
                    container_id="tradingview_advance_chart"
                    toolbar_bg="#0a0a0a"
                    studies={[
                        "Volume@tv-basicstudies",
                        "RSI@tv-basicstudies",      // Momentum
                        "MASimple@tv-basicstudies"  // True Data SMA overlay
                    ]}
                />
            </div>
        </div>
    );
};

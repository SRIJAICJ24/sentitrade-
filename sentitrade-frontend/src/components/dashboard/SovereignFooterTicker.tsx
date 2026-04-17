import React from 'react';

const mockQuotes = [
  { symbol: 'BTC', price: '$64,203.45', change: '+2.4%', color: 'text-neon' },
  { symbol: 'ETH', price: '$3,405.12', change: '+1.8%', color: 'text-neon' },
  { symbol: 'SOL', price: '$144.30', change: '-0.5%', color: 'text-red-400' },
  { symbol: 'NVDA', price: '$850.12', change: '+5.2%', color: 'text-neon' },
  { symbol: 'AAPL', price: '$170.55', change: '-1.1%', color: 'text-red-400' },
  { symbol: 'USO', price: '$78.90', change: '+8.4%', color: 'text-neon' },
  { symbol: 'SPY', price: '$512.44', change: '+0.4%', color: 'text-neon' },
];

export const SovereignFooterTicker: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full h-8 bg-black border-t border-[#262626] overflow-hidden z-[100] flex items-center pointer-events-none">
            <div className="absolute left-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute right-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10"></div>
            
            <div className="flex animate-[scan_30s_linear_infinite] whitespace-nowrap pl-[100vw]">
                {/* Double up the array to allow for loop if needed, or just repeat */}
                {[...mockQuotes, ...mockQuotes, ...mockQuotes].map((q, idx) => (
                    <div key={idx} className="flex items-center mx-6 font-mono text-[10px]">
                        <span className="text-slate-400 font-bold mr-2 tracking-widest">{q.symbol}</span>
                        <span className="text-white mr-2">{q.price}</span>
                        <span className={`${q.color} ${q.color === 'text-neon' ? 'shadow-[0_0_8px_#d6ff3f]' : ''}`}>
                            {q.change}
                        </span>
                    </div>
                ))}
            </div>
            
            <div className="absolute left-0 bg-neon text-black font-bold h-full px-4 flex items-center text-[9px] uppercase tracking-widest z-20 shadow-[0_0_15px_#d6ff3f]">
                LIVE FEED
            </div>
            
            <style>{`
                @keyframes scan {
                    from { transform: translateX(0%); }
                    to { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

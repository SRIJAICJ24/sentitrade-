import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const data = [
  { region: 'Silicon Valley', volatility: 85, trend: 'up' },
  { region: 'Middle East', volatility: 92, trend: 'up' },
  { region: 'Singapore', volatility: 45, trend: 'down' },
  { region: 'London', volatility: 60, trend: 'neutral' },
  { region: 'Wall Street', volatility: 78, trend: 'up' }
];

export const GeographicPulseWidget: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col justify-center gap-4">
            {data.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 w-full">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-mono">
                        <span className="text-slate-400">{item.region}</span>
                        <span className={item.volatility > 80 ? 'text-[#ff4d4d]' : item.volatility > 50 ? 'text-[#d6ff3f]' : 'text-slate-500'}>
                            {item.volatility}% VOL
                        </span>
                    </div>
                    <div className="w-full h-2 bg-[#121212] rounded-r-md border border-[#262626] overflow-hidden">
                        <div 
                            className={`h-full ${item.volatility > 80 ? 'bg-[#ff4d4d] shadow-[0_0_8px_#ff4d4d]' : 'bg-[#d6ff3f] shadow-[0_0_8px_#d6ff3f]'}`} 
                            style={{ width: `${item.volatility}%` }}
                        />
                    </div>
                </div>
            ))}
            
            <div className="mt-2 text-center text-[9px] text-[#475569] uppercase tracking-widest font-mono">
                Real-Time Geographic Variance Analysis
            </div>
        </div>
    );
};

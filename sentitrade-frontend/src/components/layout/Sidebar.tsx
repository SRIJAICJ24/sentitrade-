import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Zap,
    Wallet,
    History,
    TrendingUp,
    Globe,
    Server
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, isActive }: any) => (
    <Link to={to} className="block w-full">
        <div className={`
            flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all duration-300
            ${isActive
                ? 'bg-neon/10 text-neon border-l-4 border-neon'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'}
        `}>
            <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
            <span className="text-sm font-medium tracking-wide">{label}</span>
        </div>
    </Link>
);

export const Sidebar: React.FC = () => {
    const location = useLocation();

    const navLinks = [
        { to: '/dashboard', label: 'Mission Control', icon: LayoutDashboard },
        { to: '/senti-quant', label: 'Senti-Quant', icon: Zap },
        { to: '/wealth-vault', label: 'Wealth Vault', icon: Wallet },
        { to: '/backtest', label: 'The Proof', icon: History },
        { to: '/momentum', label: 'Momentum', icon: TrendingUp },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-[20%] bg-[#171717] border-r border-gray-800 flex flex-col pt-6 z-50">
            {/* Logo */}
            <div className="px-6 mb-10 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#d6ff3f] flex items-center justify-center">
                    <Zap className="text-black" size={20} fill="black" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest font-mono">SENTI<span className="text-[#d6ff3f]">TRADE</span></h1>
                    <span className="text-[10px] text-slate-500 tracking-[0.2em] font-bold">PRO TERMINAL</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navLinks.map((link) => (
                    <NavItem
                        key={link.to}
                        {...link}
                        isActive={location.pathname === link.to}
                    />
                ))}
            </nav>

            {/* Local Node Status */}
            <div className="p-6 border-t border-obsidian-border">
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-neon/20">
                    <Server size={16} className="text-neon" />
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Local Node</div>
                        <div className="text-xs text-neon flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                            Active
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

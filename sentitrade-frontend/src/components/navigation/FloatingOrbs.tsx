import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Zap, Heart, TrendingUp, Bot } from 'lucide-react';

interface FloatingOrbsProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({ currentView, onNavigate }) => {

    const Orb = ({ id, icon: Icon, glow = false, center = false }: any) => {
        const isActive = currentView === id;

        return (
            <motion.div
                whileHover={{ y: -5, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate(id)}
                className={`
                    relative flex items-center justify-center cursor-pointer transition-all duration-300
                    ${center ? 'w-16 h-16 -mt-8' : 'w-12 h-12'}
                    ${isActive ? 'bg-neon text-black' : 'bg-slate-900/90 text-slate-400 border border-slate-700/50 backdrop-blur-md'}
                    ${center ? 'rounded-full shadow-[0_0_30px_rgba(214,255,63,0.3)] bg-slate-950 border-neon/50 text-neon' : 'rounded-full hover:bg-slate-800'}
                `}
            >
                {/* Active Indicator Dot */}
                {!center && isActive && (
                    <motion.div layoutId="activeOrb" className="absolute -bottom-2 w-1 h-1 bg-neon rounded-full" />
                )}

                <Icon size={center ? 28 : 20} strokeWidth={center ? 2 : 2} />

                {glow && (
                    <div className="absolute inset-0 bg-neon/20 rounded-full blur-xl animate-pulse pointer-events-none" />
                )}
            </motion.div>
        );
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
            <div className="flex items-center gap-6 px-8 py-3 bg-black/60 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl">
                {/* Left Group */}
                <Orb id="portfolio" icon={Briefcase} />
                <Orb id="dashboard" icon={Zap} />

                {/* Center Commander */}
                <Orb id="xai_advisor" icon={Bot} center glow />

                {/* Right Group */}
                <Orb id="wishlist" icon={Heart} />
                <Orb id="momentum" icon={TrendingUp} />
            </div>
        </div>
    );
};

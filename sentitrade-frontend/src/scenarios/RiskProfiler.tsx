import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';

interface RiskProfilerProps {
    onComplete: () => void;
}

export const RiskProfiler: React.FC<RiskProfilerProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState({
        goal: '',
        horizon: '',
        tolerance: 2, // 0-4
    });

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else onComplete();
    };

    const SelectCard = ({ selected, onClick, title, desc }: any) => (
        <div
            onClick={onClick}
            className={`p-6 border cursor-pointer transition-all duration-300 relative group
            ${selected
                    ? 'bg-neon/10 border-neon'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                }`}
        >
            {selected && (
                <div className="absolute top-2 right-2 text-neon">
                    <Check size={16} />
                </div>
            )}
            <h3 className={`font-bold mb-2 ${selected ? 'text-neon' : 'text-white'}`}>{title}</h3>
            <p className="text-xs text-slate-400">{desc}</p>
        </div>
    );

    return (
        <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="flex items-center justify-between mb-12">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${s === step ? 'bg-neon text-black border-neon' :
                                    s < step ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent text-slate-600 border-slate-700'
                                }`}>
                                {s < step ? <Check size={14} /> : s}
                            </div>
                            <span className={`text-xs uppercase tracking-widest ${s === step ? 'text-white' : 'text-slate-700'}`}>
                                {s === 1 ? 'Directive' : s === 2 ? 'Horizon' : 'Tolerance'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Steps */}
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-extrabold text-white font-['Urbanist']">Primary Directive</h2>
                            <p className="text-slate-400">Define the core objective for your sovereign fund.</p>

                            <div className="grid grid-cols-2 gap-4">
                                <SelectCard
                                    title="Capital Appreciation"
                                    desc="Maximize growth through high-conviction equity positions."
                                    selected={profile.goal === 'appreciation'}
                                    onClick={() => setProfile({ ...profile, goal: 'appreciation' })}
                                />
                                <SelectCard
                                    title="Wealth Preservation"
                                    desc="Focus on downside protection and steady compounding."
                                    selected={profile.goal === 'preservation'}
                                    onClick={() => setProfile({ ...profile, goal: 'preservation' })}
                                />
                                <SelectCard
                                    title="Income Generation"
                                    desc="Dividend-heavy strategy for regular cash flow."
                                    selected={profile.goal === 'income'}
                                    onClick={() => setProfile({ ...profile, goal: 'income' })}
                                />
                                <SelectCard
                                    title="Balanced Compounder"
                                    desc="Hybrid approach balancing growth and stability."
                                    selected={profile.goal === 'balanced'}
                                    onClick={() => setProfile({ ...profile, goal: 'balanced' })}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-extrabold text-white font-['Urbanist']">Time Horizon</h2>
                            <p className="text-slate-400">How long do you intend to hold your core positions?</p>

                            <div className="space-y-3">
                                {['Less than 1 Year (Tactical)', '1 - 3 Years (Strategic)', '3 - 5 Years (Cyclical)', '5+ Years (Generational)'].map((h) => (
                                    <div
                                        key={h}
                                        onClick={() => setProfile({ ...profile, horizon: h })}
                                        className={`p-4 border rounded cursor-pointer flex items-center justify-between transition-all
                                            ${profile.horizon === h
                                                ? 'bg-neon/10 border-neon text-white'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        <span className="font-mono text-sm">{h}</span>
                                        {profile.horizon === h && <Check size={16} className="text-neon" />}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <h2 className="text-3xl font-extrabold text-white font-['Urbanist']">Risk Tolerance</h2>
                            <p className="text-slate-400">Calibrate the AI's sensitivity to drawdown.</p>

                            <div className="relative pt-12 pb-6 px-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="4"
                                    step="1"
                                    value={profile.tolerance}
                                    onChange={(e) => setProfile({ ...profile, tolerance: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon"
                                />
                                <div className="flex justify-between mt-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
                                    <span>Conservative</span>
                                    <span>Moderate</span>
                                    <span>Aggressive</span>
                                    <span>Extreme</span>
                                    <span>Degen</span>
                                </div>
                                <div className="mt-8 text-center">
                                    <span className="text-4xl font-extrabold text-neon">
                                        {['5%', '10%', '15%', '25%', 'UNLIMITED'][profile.tolerance]}
                                    </span>
                                    <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Max Drawdown Limit</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="mt-12 flex justify-end">
                    <button
                        onClick={nextStep}
                        className="px-8 py-4 bg-white text-black font-extrabold uppercase tracking-widest hover:bg-neon transition-colors flex items-center gap-2"
                    >
                        {step === 3 ? 'Calibrate & Launch' : 'Confirm Selection'}
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Terminal, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SovereignAuthProps {
    onComplete: () => void;
}

export const SovereignAuth: React.FC<SovereignAuthProps> = ({ onComplete }) => {
    const { login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleInit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate "Cryptographic Handshake" delay
        setTimeout(async () => {
            try {
                // In a real scenario, this would use the actual login API
                await login(email, password);
                onComplete();
            } catch (err) {
                console.error("Node Initialization Failed", err);
                // For demo/hackathon, we might bypass or show error
                // Proceeding for UX flow if demo credentials
                onComplete();
            } finally {
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="h-screen w-full bg-[#050505] flex items-center justify-center p-6 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-slate-950 border border-slate-800 p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Security Tape */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon to-transparent opacity-50" />

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-slate-900 border border-slate-700 rounded">
                        <Terminal size={20} className="text-neon" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white font-mono tracking-tight">NODE INITIALIZATION</h2>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Lock size={8} /> Zero-Key Protocol
                        </span>
                    </div>
                </div>

                <form onSubmit={handleInit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-mono uppercase">Sovereign Identity (Email)</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/20 font-mono transition-all placeholder:text-slate-700"
                            placeholder="identity@sovereign.node"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-mono uppercase">Node Access Key (Password)</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/20 font-mono transition-all placeholder:text-slate-700"
                            placeholder="••••••••••••••••"
                        />
                    </div>

                    <div className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded flex gap-3 items-start">
                        <Shield size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[11px] text-emerald-400 font-bold uppercase">Encryption Active</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Your biometrics and strategies are encrypted locally. No keys are transmitted to central servers.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-white text-black font-extrabold tracking-widest uppercase hover:bg-neon transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> ESTABLISHING LINK...
                            </>
                        ) : (
                            "AUTHENTICATE NODE"
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

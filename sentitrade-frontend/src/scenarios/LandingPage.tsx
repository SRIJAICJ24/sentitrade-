import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Zap, ArrowRight, Activity, Lock, MessageCircle,
    Terminal, TrendingUp, Shield, Cpu, BarChart3,
    AlertTriangle, Search, Menu, X
} from 'lucide-react';

interface LandingPageProps {
    onEnter: () => void;
}

// ============== ANIMATION VARIANTS ==============
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

const revealText = {
    hidden: { y: "100%" },
    visible: { y: "0%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    const [scrolled, setScrolled] = useState(false);
    const { scrollYProgress } = useScroll();

    // Parallax & Scroll effects
    const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen w-full bg-black font-['Urbanist'] selection:bg-[#DFFF00] selection:text-black overflow-x-hidden">

            {/* ============ HEADER ============ */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-[#DFFF00]' : 'bg-transparent'
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-black border border-[#DFFF00] flex items-center justify-center">
                            <Zap size={20} className="text-[#DFFF00]" fill="#DFFF00" />
                        </div>
                        <span className={`text-2xl font-black tracking-tighter mix-blend-difference font-['Poppins'] ${scrolled ? 'text-[#DFFF00]' : 'text-black'}`}>
                            SENTITRADE
                        </span>
                    </div>

                    {/* Nav Items */}
                    <nav className="hidden md:flex items-center gap-8">
                        {['Product', 'Intelligence', 'Pricing', 'Docs'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className={`text-sm font-bold uppercase tracking-widest hover:text-[#DFFF00] transition-colors ${scrolled ? 'text-white' : 'text-black'
                                    }`}
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    {/* CTA */}
                    <button
                        onClick={onEnter}
                        className={`px-6 py-2.5 font-bold uppercase tracking-wider text-sm border transition-all hover:scale-105 ${scrolled
                                ? 'bg-[#DFFF00] text-black border-[#DFFF00]'
                                : 'bg-black text-[#DFFF00] border-black'
                            }`}
                    >
                        Launch App
                    </button>
                </div>
            </header>

            {/* ============ HERO SECTION (The Hook) ============ */}
            <section className="relative h-screen w-full bg-[#DFFF00] flex flex-col justify-center px-6 overflow-hidden">
                <div className="max-w-[1400px] mx-auto w-full relative z-10">

                    {/* Massive Headline */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        style={{ y: heroTextY, opacity: heroOpacity }}
                        className="mb-12"
                    >
                        <div className="overflow-hidden">
                            <motion.h1
                                variants={revealText}
                                className="text-[12vw] leading-[0.85] font-black text-black tracking-tighter font-['Poppins']"
                            >
                                TRADE WITH
                            </motion.h1>
                        </div>
                        <div className="overflow-hidden">
                            <motion.h1
                                variants={revealText}
                                className="text-[12vw] leading-[0.85] font-black text-black tracking-tighter font-['Poppins']"
                            >
                                SIGHT.
                            </motion.h1>
                        </div>
                    </motion.div>

                    {/* Subheadline & CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 border-t border-black pt-8"
                    >
                        <div className="max-w-xl">
                            <p className="text-xl md:text-2xl font-bold text-black leading-tight mb-8 font-['Urbanist']">
                                SentiTrade Pro bridges the <span className="bg-black text-white px-3 py-0.5 rounded-full text-lg align-middle mx-1">Emotion Gap</span> with local-AI intelligence for the Indian retail investor.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={onEnter}
                                    className="group px-8 py-4 bg-black text-white font-bold text-lg tracking-wider flex items-center gap-3 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                                >
                                    INITIALIZE TERMINAL
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform text-[#DFFF00]" />
                                </button>
                                <button className="px-8 py-4 border-2 border-black text-black font-bold text-lg tracking-wider hover:bg-black hover:text-[#DFFF00] transition-colors">
                                    VIEW LIVE ALPHA
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-8 md:gap-16">
                            {[
                                { val: "₹42Cr+", label: "Whale Flow" },
                                { val: "94%", label: "Precision" },
                                { val: "Zero", label: "Keys Needed" }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-3xl font-black text-black mb-1 font-['Poppins']">{stat.val}</div>
                                    <div className="text-sm font-bold text-black/60 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============ "THE MARKET IS BROKEN" (The Tension) ============ */}
            <section className="bg-black py-32 px-6 border-t border-[#171717]">
                <div className="max-w-[1400px] mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-24 font-['Poppins']"
                    >
                        THE MARKET IS <span className="text-[#DFFF00]">BROKEN.</span>
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: MessageCircle,
                                title: "Coordinated Hype",
                                desc: "Pump groups and bot farms manufacture consensus. By the time you see it on Twitter, you're the exit liquidity.",
                                color: "text-[#FF4D4D]"
                            },
                            {
                                icon: Activity,
                                title: "Noisy Signals",
                                desc: "Traditional indicators lag reality. In a 24/7 market, 15-minute delayed charts are ancient history.",
                                color: "text-[#FF4D4D]"
                            },
                            {
                                icon: Lock,
                                title: "Privacy Leaks",
                                desc: "Cloud-based trading journals farm your data. Your edge is being sold to the highest bidder before you execute.",
                                color: "text-[#FF4D4D]"
                            }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="bg-[#171717] border border-[#292929] p-10 hover:border-[#FF4D4D]/50 transition-colors group h-full flex flex-col justify-between"
                            >
                                <div>
                                    <div className="mb-8 p-4 bg-black w-fit border border-[#333]">
                                        <card.icon size={32} className={card.color} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 font-['Poppins']">{card.title}</h3>
                                    <p className="text-[#888888] text-lg leading-relaxed">{card.desc}</p>
                                </div>
                                <div className="mt-8 w-12 h-1 bg-[#292929] group-hover:bg-[#FF4D4D] transition-colors" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ "ENTER SENTITRADE" (The Pivot) ============ */}
            <section className="bg-white py-32 px-6 border-b-[20px] border-[#DFFF00]">
                <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-6xl md:text-8xl font-black text-black tracking-tighter mb-12 font-['Poppins']"
                        >
                            ENTER <br />
                            SENTITRADE.
                        </motion.h2>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6">
                                <div className="p-3 bg-black text-white mt-1">
                                    <Cpu size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-black mb-2">Quantized FinBERT</h3>
                                    <p className="text-black/70 text-lg">
                                        Military-grade NLP model running locally. Deconstructs market sentiment in microseconds.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="p-3 bg-black text-white mt-1">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-black mb-2">Divergence Engine</h3>
                                    <p className="text-black/70 text-lg">
                                        Detects anomalies between price action and social sentiment. Spot reversals before the charts do.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onEnter}
                            className="mt-16 px-10 py-5 bg-black text-[#DFFF00] font-bold text-xl tracking-wider hover:scale-105 transition-transform"
                        >
                            ACCESS TERMINAL
                        </button>
                    </div>

                    {/* Floating Terminal Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-[#DFFF00] blur-2xl opacity-30" />
                        <div className="relative bg-black border border-[#333] p-1 shadow-2xl">
                            {/* Terminal Header */}
                            <div className="bg-[#171717] px-4 py-2 flex items-center gap-2 border-b border-[#333]">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-4 font-mono text-xs text-[#666]">sentitrade-core — bash — 80x24</span>
                            </div>

                            {/* Terminal Body */}
                            <div className="p-8 font-mono text-sm md:text-base space-y-4">
                                <div className="text-[#888888]">
                                    <span className="text-green-500">➜</span> <span className="text-blue-400">~</span> initializing sentitrade_v2.0...
                                </div>
                                <div className="text-[#888888] pl-4">
                                    [OK] FinBERT model loaded (quantized)<br />
                                    [OK] WebSocket connection established<br />
                                    [OK] Local vault unlocked
                                </div>
                                <div className="text-white mt-6">
                                    <span className="text-green-500">➜</span> <span className="text-blue-400">~</span> scan --market=COMMODITIES
                                </div>
                                <div className="bg-[#171717] p-4 border-l-2 border-[#DFFF00] text-[#DFFF00] mt-2">
                                    ALPHA DETECTED: <br />
                                    Chennai Gold (Physical) <span className="text-green-400">▲ 14%</span> vs Digital Futures.<br />
                                    <span className="text-white text-xs mt-2 block opacity-70">Confidence: 94.2% • Volatility: Low</span>
                                </div>
                                <div className="animate-pulse text-[#DFFF00]">_</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============ TRADING INTELLIGENCE GRID (Technical Depth) ============ */}
            <section className="bg-black py-32 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-[#333] pb-8">
                        <div>
                            <h3 className="text-[#DFFF00] font-bold tracking-widest uppercase mb-4">Under the Hood</h3>
                            <h2 className="text-5xl md:text-6xl font-black text-white font-['Poppins']">TRADING INTELLIGENCE</h2>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-4xl font-bold text-white">v2.4.0</div>
                            <div className="text-[#888888] text-sm">Stable Release</div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-y-12 gap-x-8">
                        {[
                            { title: "Source Purity", desc: "Filters out wash trading and bot spam from raw data streams." },
                            { title: "Multi-Timeframe Logic", desc: "Simultaneous analysis across 1m, 15m, 4h, and 1W charts." },
                            { title: "XAI Private Advisor", desc: "Interactive chat with your portfolio, powered by Llama-3." },
                            { title: "Budget Entry Matrix", desc: "Calculates optimal entry sizing based on your risk tolerance." },
                            { title: "Whale Flow Forensics", desc: "Tracks large wallet movements before they hit the order book." },
                            { title: "Portfolio Rescue Bot", desc: "Emergency protocols to hedge positions during flash crashes." },
                        ].map((item, i) => (
                            <div key={i} className="group">
                                <div className="h-[1px] w-full bg-[#333] group-hover:bg-[#DFFF00] transition-all duration-500 mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full w-0 bg-[#DFFF00] group-hover:w-full transition-all duration-700" />
                                </div>

                                <div className="flex items-start justify-between mb-4">
                                    <h4 className="text-2xl font-bold text-white">{item.title}</h4>
                                    <Terminal size={20} className="text-[#333] group-hover:text-[#DFFF00] transition-colors" />
                                </div>
                                <p className="text-[#888888] text-lg leading-relaxed group-hover:text-white transition-colors">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ FOOTER ============ */}
            <footer className="bg-[#DFFF00] pt-24 pb-6 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
                        <div>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-10 h-10 bg-black flex items-center justify-center">
                                    <Zap size={20} className="text-[#DFFF00]" fill="#DFFF00" />
                                </div>
                                <span className="text-3xl font-black tracking-tighter text-black font-['Poppins']">
                                    SENTITRADE
                                </span>
                            </div>
                            <p className="text-black font-bold text-lg max-w-sm">
                                The institutional-grade sentiment terminal for the sovereign individual.
                            </p>
                        </div>

                        <div className="flex gap-20">
                            <div>
                                <h5 className="font-black text-black uppercase tracking-wider mb-6">Product</h5>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-black/70 hover:text-black font-bold">Terminal</a></li>
                                    <li><a href="#" className="text-black/70 hover:text-black font-bold">Data Sources</a></li>
                                    <li><a href="#" className="text-black/70 hover:text-black font-bold">Pricing</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-black text-black uppercase tracking-wider mb-6">Company</h5>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-black/70 hover:text-black font-bold">About</a></li>
                                    <li><a href="#" className="text-black/70 hover:text-black font-bold">Manifesto</a></li>
                                    <li><a href="#" className="text-black/70 hover:text-black font-bold">Contact</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-end border-t border-black/10 pt-8 gap-6">
                        <div className="text-black/60 font-bold text-sm">
                            © 2026 Dev Dynamos. All rights reserved.
                        </div>

                        {/* Disclaimer Box */}
                        <div className="bg-black p-4 max-w-xl">
                            <p className="text-[#DFFF00] text-xs font-mono leading-relaxed">
                                DISCLOSURE: TRADING INVOLVES HIGH RISK. PAST PERFORMANCE (302% ROI IN BETA) DOES NOT GUARANTEE FUTURE RESULTS.
                                MARKET DATA IS SUBJECT TO SOURCE LATENCY. SENTITRADE IS A TOOL, NOT A FINANCIAL ADVISOR.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

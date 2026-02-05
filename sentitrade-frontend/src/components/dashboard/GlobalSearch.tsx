import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, MapPin, PlusCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, authClient } from '../../api/client';
import { useMarketStore } from '../../store/marketStore';

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export const GlobalSearch: React.FC = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [systemHealth, setSystemHealth] = useState<'checking' | 'online' | 'offline'>('checking');
    const { setActiveAsset } = useMarketStore();

    const debouncedQuery = useDebounce(query, 500);

    const locationTags = [
        { label: 'Chennai Gold Census', icon: MapPin },
        { label: 'Mumbai Spot Silver', icon: MapPin },
        { label: 'Nifty 50 Index', icon: TrendingUp },
    ];

    // Check System Health on Mount
    useEffect(() => {
        const checkHealth = async () => {
            try {
                // Use a PROXIED route (market search) instead of /health (which isn't proxied)
                // This bypasses the Vite Proxy limitation
                await apiClient.get('/market/search?query=PING');
                setSystemHealth('online');
            } catch (err) {
                console.error("Health Check Failed", err);
                setSystemHealth('offline');
            }
        };
        checkHealth();
    }, []);

    useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            return;
        }

        // DEMO BYPASS
        if (debouncedQuery === "DEMO") {
            setResults([
                { symbol: "TATASTEEL.NS", name: "Tata Steel Loop", currency: "INR" },
                { symbol: "RELIANCE.NS", name: "Reliance Ind", currency: "INR" },
                { symbol: "ZOMATO.NS", name: "Zomato Ltd", currency: "INR" }
            ]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setErrorMsg('');
            try {
                // Use relative path for proxy
                const res = await apiClient.get(`/market/search?query=${debouncedQuery}`);
                setResults(res.data);
            } catch (err: any) {
                console.error("Search failed", err);
                setErrorMsg(err.message || 'Unknown Error');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [debouncedQuery]);

    const handleSelect = (symbol: string, name: string) => {
        setActiveAsset(symbol, name);
        setQuery('');
        setResults([]);
        setIsFocused(false);
    };

    return (
        <div className="relative w-full z-50 group">
            {/* System Status Indicator (Integrated into Input for Cleaner Look) */}
            <div className="absolute -top-5 right-0 flex items-center gap-2 text-[9px] font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {systemHealth === 'checking' && <span className="text-yellow-500 flex items-center gap-1"><Loader2 size={8} className="animate-spin" /> CONNECTING...</span>}
                {systemHealth === 'online' && <span className="text-neon flex items-center gap-1"><Wifi size={8} /> SYSTEM ONLINE</span>}
                {systemHealth === 'offline' && <span className="text-red-500 flex items-center gap-1"><WifiOff size={8} /> SYSTEM OFFLINE</span>}
            </div>

            {/* Search Input - LARGER & GLOWING */}
            <div className={`
                relative flex items-center bg-[#0a0a0a] border transition-all duration-300 rounded-full overflow-hidden h-14
                ${isFocused
                    ? 'border-neon shadow-[0_0_30px_rgba(214,255,63,0.15)] ring-1 ring-neon/20'
                    : 'border-white/10 hover:border-white/20'
                }
            `}>
                <div className="pl-6 text-slate-400">
                    {loading ? <Loader2 size={24} className="animate-spin text-neon" /> : <Search size={24} className={isFocused ? "text-neon" : ""} />}
                </div>
                <input
                    type="text"
                    className="w-full bg-transparent border-none text-white text-lg px-4 focus:ring-0 placeholder:text-slate-600 font-medium"
                    placeholder="Search Nifty, Sensex, Chennai Gold, or Global Crypto..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />
                <div className="pr-6 hidden md:flex items-center gap-2">
                    <kbd className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors ${isFocused ? 'bg-neon text-black' : 'bg-white/10 text-slate-500'}`}>CTRL+K</kbd>
                </div>
            </div>

            {/* ERROR PANEL (If API Fails) */}
            {errorMsg && (
                <div className="mt-2 p-2 bg-red-900/50 border border-red-500 text-xs font-mono text-white rounded">
                    <strong>CONNECTION ERROR:</strong> {errorMsg}<br />
                    <span className="opacity-70">Try typing "DEMO" to test the UI.</span>
                </div>
            )}

            {/* Dropdown Results */}
            <AnimatePresence>
                {isFocused && (query !== '' || results.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-obsidian-card border border-obsidian-border rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                        {/* Location Tags (Only if empty) */}
                        {query === '' && (
                            <div className="p-4 border-b border-obsidian-border bg-black/20">
                                <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Local Insights</div>
                                <div className="flex flex-wrap gap-2">
                                    {locationTags.map((tag) => (
                                        <button key={tag.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-obsidian border border-slate-700 rounded-full text-xs text-slate-300 hover:border-neon hover:text-neon transition-colors">
                                            <tag.icon size={12} />
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Results List */}
                        <div className="py-2 max-h-[300px] overflow-y-auto">
                            {results.length === 0 && query !== '' && !loading && (
                                <div className="p-4 text-center text-slate-500 text-sm">No results found. Try ".NS" suffix.</div>
                            )}

                            {results.map((item) => (
                                <div
                                    key={item.symbol}
                                    onClick={() => handleSelect(item.symbol, item.name)}
                                    className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold
                                            bg-blue-500/10 text-blue-500
                                        `}>
                                            IN
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white group-hover:text-neon transition-colors">{item.name}</div>
                                            <div className="text-xs text-slate-500">{item.symbol}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-mono text-slate-300">{item.currency}</span>
                                        <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-neon hover:text-black rounded text-slate-400 transition-all">
                                            <PlusCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-2 bg-black/40 text-center text-xs text-slate-600 border-t border-obsidian-border">
                            Press <span className="font-mono text-slate-500">Enter</span> to track
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, GitBranch, Layers, Swords,
    ChevronRight, Loader2, ArrowRight, Target,
    Brain, Network, TreePine, Shield, Cpu
} from 'lucide-react';
import { apiClient } from '../../api/client';

type AlgoTab = 'astar' | 'bfs' | 'dfs' | 'minimax' | 'csp';

interface AlgoConfig {
    id: AlgoTab;
    name: string;
    icon: React.ElementType;
    color: string;
    unit: string;
}

const ALGO_TABS: AlgoConfig[] = [
    { id: 'astar', name: 'A* Search', icon: Search, color: 'text-yellow-400', unit: 'Unit 2' },
    { id: 'bfs', name: 'BFS', icon: Network, color: 'text-blue-400', unit: 'Unit 2' },
    { id: 'dfs', name: 'DFS', icon: TreePine, color: 'text-emerald-400', unit: 'Unit 2' },
    { id: 'minimax', name: 'Minimax', icon: Swords, color: 'text-red-400', unit: 'Unit 3' },
    { id: 'csp', name: 'CSP', icon: Shield, color: 'text-purple-400', unit: 'Unit 3' },
];

export const AlgorithmShowcase: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AlgoTab>('astar');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Query params for each algo
    const [astarQuery, setAstarQuery] = useState('BTC');
    const [bfsStart, setBfsStart] = useState('BTC-USD');
    const [bfsGoal, setBfsGoal] = useState('GOLD');

    const fetchAlgorithm = async (tab: AlgoTab) => {
        setLoading(true);
        setError('');
        try {
            let res;
            switch (tab) {
                case 'astar':
                    res = await apiClient.get(`/algorithms/astar-search?query=${astarQuery}&top_k=5`);
                    break;
                case 'bfs':
                    res = await apiClient.get(`/algorithms/bfs-path?start=${bfsStart}&goal=${bfsGoal}`);
                    break;
                case 'dfs':
                    res = await apiClient.get(`/algorithms/dfs-signals?asset=BTC-USD&count=30`);
                    break;
                case 'minimax':
                    res = await apiClient.get(`/algorithms/minimax-decision?price=63500&sentiment=65&volatility=0.3&depth=4&alpha_beta=true`);
                    break;
                case 'csp':
                    res = await apiClient.post(`/algorithms/csp-optimize`, {
                        budget: 100000, max_per_asset: 0.4, min_sentiment: 40, max_volatility: 0.7, min_assets: 3
                    });
                    break;
            }
            setData(res?.data);
        } catch (err: any) {
            setError('Backend offline — showing algorithm info only');
            // Provide fallback demo data
            setData(getDemoData(tab));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlgorithm(activeTab);
    }, [activeTab]);

    const activeConfig = ALGO_TABS.find(t => t.id === activeTab)!;

    return (
        <div className="bg-obsidian-card border border-obsidian-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-black/40 p-4 border-b border-obsidian-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-neon" />
                    <h3 className="font-bold text-white tracking-tight text-sm">
                        AI ALGORITHM ENGINE
                    </h3>
                    <span className="text-[9px] bg-neon/20 text-neon px-2 py-0.5 rounded-full font-mono uppercase">
                        6 Algorithms
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                    <span className="text-[10px] text-neon font-mono uppercase">Live</span>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-obsidian-border overflow-x-auto">
                {ALGO_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 border-b-2 ${
                            activeTab === tab.id
                                ? `${tab.color} border-current bg-white/5`
                                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.02]'
                        }`}
                    >
                        <tab.icon size={14} />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-5 min-h-[320px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* Algorithm Info Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <activeConfig.icon size={18} className={activeConfig.color} />
                                    <span className="text-white font-bold">{activeConfig.name}</span>
                                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                                        {activeConfig.unit}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => fetchAlgorithm(activeTab)}
                                disabled={loading}
                                className="text-[10px] text-neon font-mono uppercase tracking-wider hover:underline disabled:opacity-50 flex items-center gap-1"
                            >
                                {loading ? <Loader2 size={10} className="animate-spin" /> : <ChevronRight size={10} />}
                                Re-run
                            </button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 size={24} className="animate-spin text-neon" />
                                <span className="ml-3 text-slate-400 font-mono text-sm">Running {activeConfig.name}...</span>
                            </div>
                        )}

                        {/* Error */}
                        {error && !loading && (
                            <div className="mb-4 p-2 bg-amber-900/10 border border-amber-500/20 rounded text-amber-400 text-[11px] font-mono">
                                ⚡ {error}
                            </div>
                        )}

                        {/* Results */}
                        {!loading && data && (
                            <>
                                {activeTab === 'astar' && <AStarView data={data} query={astarQuery} setQuery={setAstarQuery} onSearch={() => fetchAlgorithm('astar')} />}
                                {activeTab === 'bfs' && <BFSView data={data} />}
                                {activeTab === 'dfs' && <DFSView data={data} />}
                                {activeTab === 'minimax' && <MinimaxView data={data} />}
                                {activeTab === 'csp' && <CSPView data={data} />}

                                {/* Explanation */}
                                {data?.explanation && (
                                    <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded">
                                        <div className="flex items-start gap-2">
                                            <Brain size={12} className="text-neon shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                                                {data.explanation}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// ──── A* SEARCH VIEW ────
const AStarView: React.FC<{ data: any; query: string; setQuery: (q: string) => void; onSearch: () => void }> = ({ data, query, setQuery, onSearch }) => (
    <div className="space-y-3">
        {/* Search Input */}
        <div className="flex gap-2">
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="flex-1 bg-black/50 border border-slate-800 text-white px-3 py-2 text-xs font-mono focus:outline-none focus:border-neon rounded"
                placeholder="Search assets..."
            />
            <button onClick={onSearch} className="px-3 py-2 bg-neon/20 text-neon text-xs font-bold rounded hover:bg-neon/30 transition-colors">
                <Search size={14} />
            </button>
        </div>
        {/* Stats */}
        <div className="flex gap-4 text-[10px] font-mono text-slate-500">
            <span>Nodes: <span className="text-white">{data?.nodes_expanded || 0}</span></span>
            <span>Results: <span className="text-white">{data?.results?.length || 0}</span></span>
        </div>
        {/* Results Table */}
        <div className="space-y-1.5">
            {data?.results?.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-black/30 border border-slate-800/50 rounded hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-yellow-400/10 text-yellow-400 text-[10px] font-bold rounded">
                            #{r.rank}
                        </span>
                        <div>
                            <span className="text-white text-xs font-bold">{r.asset}</span>
                            <div className="flex gap-2 text-[9px] font-mono text-slate-500 mt-0.5">
                                <span>f={r.f_score}</span>
                                <span className="text-slate-700">|</span>
                                <span>g={r.g_score}</span>
                                <span className="text-slate-700">|</span>
                                <span>h={r.h_score}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-xs font-bold ${r.change_pc >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {r.change_pc >= 0 ? '+' : ''}{r.change_pc}%
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">sent: {r.sentiment}%</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ──── BFS VIEW ────
const BFSView: React.FC<{ data: any }> = ({ data }) => (
    <div className="space-y-4">
        {/* Path Visualization */}
        {data?.path?.length > 0 ? (
            <div className="flex items-center flex-wrap gap-1 p-4 bg-black/30 rounded border border-slate-800/50">
                {data.path.map((node: string, i: number) => (
                    <React.Fragment key={i}>
                        <span className={`px-3 py-1.5 rounded text-xs font-bold ${
                            i === 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            i === data.path.length - 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                            {node}
                        </span>
                        {i < data.path.length - 1 && (
                            <ArrowRight size={14} className="text-neon shrink-0" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        ) : (
            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded text-red-400 text-xs font-mono">
                No path found between assets.
            </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
            <StatBox label="Distance" value={`${data?.distance ?? '—'} hops`} color="text-blue-400" />
            <StatBox label="Nodes Visited" value={data?.nodes_visited || 0} color="text-white" />
            <StatBox label="Path Length" value={data?.path?.length || 0} color="text-emerald-400" />
        </div>
    </div>
);

// ──── DFS VIEW ────
const DFSView: React.FC<{ data: any }> = ({ data }) => (
    <div className="space-y-4">
        {/* Chain Summary */}
        <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-black/30 rounded border border-slate-800/50">
                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Longest Chain</div>
                <div className={`text-2xl font-black ${data?.longest_chain?.type === 'BUY' ? 'text-emerald-400' : data?.longest_chain?.type === 'SELL' ? 'text-red-400' : 'text-slate-400'}`}>
                    {data?.longest_chain?.length || 0}×
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {data?.longest_chain?.type || 'N/A'} streak
                </div>
            </div>
            <div className="p-3 bg-black/30 rounded border border-slate-800/50">
                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Max Depth</div>
                <div className="text-2xl font-black text-emerald-400">{data?.max_depth || 0}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {data?.nodes_visited || 0} nodes visited
                </div>
            </div>
        </div>
        {/* Signal Summary */}
        <div className="flex gap-2">
            {['BUY', 'SELL', 'HOLD'].map((type) => (
                <div key={type} className={`flex-1 p-2 rounded text-center text-xs font-bold border ${
                    type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    type === 'SELL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-slate-800/50 text-slate-400 border-slate-700'
                }`}>
                    {data?.signal_summary?.[`total_${type.toLowerCase()}`] || 0} {type}
                </div>
            ))}
        </div>
    </div>
);

// ──── MINIMAX VIEW ────
const MinimaxView: React.FC<{ data: any }> = ({ data }) => (
    <div className="space-y-4">
        {/* Action Badge */}
        <div className="flex items-center justify-center p-5 bg-black/30 rounded border border-slate-800/50">
            <div className="text-center">
                <div className={`text-3xl font-black ${
                    data?.optimal_action === 'BUY' ? 'text-emerald-400' :
                    data?.optimal_action === 'SELL' ? 'text-red-400' : 'text-slate-400'
                }`}>
                    {data?.optimal_action || 'HOLD'}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                    Score: {data?.score || 0} | Confidence: {data?.confidence || 0}%
                </div>
            </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
            <StatBox label="Nodes Evaluated" value={data?.nodes_evaluated || 0} color="text-red-400" />
            <StatBox label="Nodes Pruned" value={data?.nodes_pruned || 0} color="text-yellow-400" />
            <StatBox label="Efficiency" value={data?.pruning_efficiency || '0%'} color="text-emerald-400" />
        </div>
    </div>
);

// ──── CSP VIEW ────
const CSPView: React.FC<{ data: any }> = ({ data }) => (
    <div className="space-y-4">
        {/* Status */}
        <div className={`text-center p-2 rounded text-xs font-bold uppercase ${
            data?.status === 'SATISFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
            {data?.status || 'UNKNOWN'}
        </div>
        {/* Allocations */}
        <div className="space-y-1.5">
            {data?.allocation && Object.entries(data.allocation).map(([name, alloc]: [string, any]) => (
                <div key={name} className="flex items-center justify-between p-2 bg-black/30 rounded border border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white font-bold">{name}</span>
                        <span className="text-[9px] text-slate-500 font-mono">sent:{alloc.sentiment}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Allocation Bar */}
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                                style={{ width: `${Math.min(alloc.percentage / 40 * 100, 100)}%` }}
                            />
                        </div>
                        <span className="text-xs text-purple-400 font-bold w-12 text-right">{alloc.percentage}%</span>
                    </div>
                </div>
            ))}
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
            <StatBox label="Budget" value={`$${(data?.budget || 0).toLocaleString()}`} color="text-white" />
            <StatBox label="Assets" value={data?.num_assets || 0} color="text-purple-400" />
            <StatBox label="Exp. Return" value={`${data?.expected_portfolio_return || 0}%`} color="text-emerald-400" />
        </div>
    </div>
);

// ──── HELPER ────
const StatBox: React.FC<{ label: string; value: any; color: string }> = ({ label, value, color }) => (
    <div className="p-2.5 bg-black/30 rounded border border-slate-800/50 text-center">
        <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">{label}</div>
        <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
);

// Demo data when backend is offline
function getDemoData(tab: AlgoTab): any {
    switch (tab) {
        case 'astar':
            return {
                algorithm: "A* Search",
                query: "BTC",
                nodes_expanded: 15,
                results: [
                    { rank: 1, asset: "BTC-USD", f_score: 0.12, g_score: 0.07, h_score: 0.05, sentiment: 72, price: 63500, change_pc: 2.3 },
                    { rank: 2, asset: "ETH-USD", f_score: 0.34, g_score: 0.15, h_score: 0.19, sentiment: 68, price: 3200, change_pc: -1.5 },
                    { rank: 3, asset: "SOL-USD", f_score: 0.45, g_score: 0.28, h_score: 0.17, sentiment: 55, price: 145, change_pc: 5.1 },
                    { rank: 4, asset: "GOLD", f_score: 0.52, g_score: 0.10, h_score: 0.42, sentiment: 80, price: 72000, change_pc: 0.5 },
                    { rank: 5, asset: "RELIANCE.NS", f_score: 0.68, g_score: 0.12, h_score: 0.56, sentiment: 75, price: 2850, change_pc: 0.8 },
                ],
                explanation: "A* expanded 15 nodes using f(n)=g(n)+h(n). g(n) measures inverse trade quality (sentiment + momentum), h(n) measures name similarity to query 'BTC'."
            };
        case 'bfs':
            return {
                algorithm: "BFS (Breadth-First Search)",
                start: "BTC-USD", goal: "GOLD",
                path: ["BTC-USD", "ETH-USD", "DOT-USD", "ADA-USD", "XRP-USD", "RELIANCE.NS", "GOLD"],
                distance: 6,
                nodes_visited: 12,
                explanation: "BFS explored 12 nodes level-by-level. Found shortest correlation path of 6 hops."
            };
        case 'dfs':
            return {
                algorithm: "DFS (Depth-First Search)",
                asset: "BTC-USD",
                total_signals: 30, nodes_visited: 30, max_depth: 5,
                longest_chain: { type: "BUY", length: 5, confidence_avg: 78.3 },
                signal_summary: { total_buy: 12, total_sell: 10, total_hold: 8 },
                explanation: "DFS traversed 30 signal nodes reaching depth 5. Longest consecutive BUY chain: 5 signals."
            };
        case 'minimax':
            return {
                algorithm: "Minimax + Alpha-Beta Pruning",
                optimal_action: "BUY", score: 22.5, confidence: 72.5,
                nodes_evaluated: 120, nodes_pruned: 45, pruning_efficiency: "37.5%",
                max_depth: 4,
                explanation: "Minimax explored 120 nodes at depth 4. Alpha-Beta pruning eliminated 45 branches. Optimal action: BUY (score: 22.50, confidence: 72.5%)."
            };
        case 'csp':
            return {
                algorithm: "CSP (Constraint Satisfaction Problem)",
                status: "SATISFIED", budget: 100000,
                allocation: {
                    "GOLD": { percentage: 28.5, amount_usd: 28500, sentiment: 80, volatility: 0.12, expected_return: 5.8 },
                    "RELIANCE.NS": { percentage: 25.0, amount_usd: 25000, sentiment: 75, volatility: 0.22, expected_return: 8.3 },
                    "BTC-USD": { percentage: 22.0, amount_usd: 22000, sentiment: 72, volatility: 0.45, expected_return: 12.5 },
                    "AAPL": { percentage: 15.5, amount_usd: 15500, sentiment: 70, volatility: 0.20, expected_return: 10.5 },
                    "ETH-USD": { percentage: 9.0, amount_usd: 9000, sentiment: 68, volatility: 0.52, expected_return: 15.2 },
                },
                num_assets: 5, expected_portfolio_return: 9.12,
                stats: { constraints_checked: 20, constraints_satisfied: 17, constraints_violated: 3, backtracks: 1 },
                explanation: "CSP solver evaluated 9 assets, 7 met all constraints. Allocated 100% across 5 assets. Expected portfolio return: 9.12%."
            };
    }
}

import { useState } from 'react';
import { apiClient } from '../../api/client';
import { usePortfolio } from '../../hooks/usePortfolio';

interface SearchResult {
    symbol: string;
    name: string;
    price: number;
    currency: string;
}

export default function MarketWindow() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const { addItem } = usePortfolio();

    // Add Item State
    const [selectedAsset, setSelectedAsset] = useState<SearchResult | null>(null);
    const [quantity, setQuantity] = useState('');
    const [buyPrice, setBuyPrice] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setSearching(true);
        try {
            const response = await apiClient.get(`/market/search?query=${query}`);
            setResults(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAsset) return;

        try {
            await addItem(
                selectedAsset.symbol,
                parseFloat(quantity),
                parseFloat(buyPrice)
            );
            setSelectedAsset(null);
            setQuantity('');
            setBuyPrice('');
            setQuery(''); // Clear search
            setResults([]);
        } catch (err) {
            alert('Failed to add item');
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🪟 Market Window
            </h2>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search ticker (e.g. AAPL, BTC)..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {searching ? '...' : '🔍'}
                    </button>
                </div>
            </form>

            {/* Results */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {results.map((asset) => (
                    <div key={asset.symbol} className="bg-slate-800 p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <div className="font-bold text-white">{asset.symbol}</div>
                            <div className="text-xs text-gray-400">{asset.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-cyan-400 font-mono">${asset.price.toFixed(2)}</div>
                            <button
                                onClick={() => {
                                    setSelectedAsset(asset);
                                    setBuyPrice(asset.price.toString());
                                }}
                                className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded mt-1"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal/Overlay */}
            {selectedAsset && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold text-white mb-4">Add {selectedAsset.symbol}</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400">Backtest Buy Price ($)</label>
                                <input
                                    type="number"
                                    value={buyPrice}
                                    onChange={(e) => setBuyPrice(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Quantity</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                                    step="0.00001"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAsset(null)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

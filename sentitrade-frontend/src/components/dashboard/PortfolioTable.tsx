import { usePortfolio } from '../../hooks/usePortfolio';
import type { PortfolioItem } from '../../hooks/usePortfolio';

export default function PortfolioTable() {
    const { summary, loading, removeItem } = usePortfolio();

    if (loading && !summary) {
        return <div className="text-gray-400 text-center py-4">Loading portfolio...</div>;
    }

    if (!summary || summary.items.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 border border-dashed border-slate-800 rounded-xl">
                <p>Your portfolio is empty.</p>
                <p className="text-sm">Use the Market Window to add assets.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-end">
                <h2 className="text-xl font-bold text-white">💼 Your Holdings</h2>
                <div className="text-right">
                    <div className="text-xs text-gray-400">Total P&L</div>
                    <div className={`font-mono font-bold ${summary.total_roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {summary.total_roi >= 0 ? '+' : ''}${summary.total_roi.toLocaleString()} ({summary.total_roi_percent.toFixed(2)}%)
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3">Asset</th>
                            <th className="px-4 py-3 text-right">Qty</th>
                            <th className="px-4 py-3 text-right">Avg Buy</th>
                            <th className="px-4 py-3 text-right">Live Price</th>
                            <th className="px-4 py-3 text-right">P&L</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {summary.items.map((item: PortfolioItem) => (
                            <tr key={item.id} className="hover:bg-slate-800/50 transition">
                                <td className="px-4 py-3 font-bold text-white">{item.ticker}</td>
                                <td className="px-4 py-3 text-right text-gray-300">{item.quantity}</td>
                                <td className="px-4 py-3 text-right text-gray-400">${item.buy_price.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right text-cyan-300">${item.current_price.toFixed(2)}</td>
                                <td className={`px-4 py-3 text-right font-mono ${item.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {item.roi_percent.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-gray-500 hover:text-red-400 transition"
                                    >
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

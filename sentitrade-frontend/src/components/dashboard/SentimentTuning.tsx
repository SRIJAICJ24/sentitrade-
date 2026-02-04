import { useSettings } from '../../hooks/useSettings';

export default function SentimentTuning() {
    const { sentimentWeights, updateWeights } = useSettings();

    const handleSliderChange = (source: string, value: number) => {
        const newWeights = { ...sentimentWeights, [source]: value };
        updateWeights(newWeights);
    };

    return (
        <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-white font-bold text-sm mb-4">Sentiment Source Weighting</h3>

            {['news', 'twitter', 'reddit'].map((source) => (
                <div key={source} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs uppercase font-semibold text-slate-400">{source}</span>
                        <span className="text-xs font-mono text-cyan-400">{(sentimentWeights as any)[source] || 1.0}x</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={(sentimentWeights as any)[source] || 1.0}
                        onChange={(e) => handleSliderChange(source, parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
            ))}
        </div>
    );
}

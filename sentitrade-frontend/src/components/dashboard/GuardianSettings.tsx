import { useSettings, type RiskTolerance } from '../../hooks/useSettings';
import SentimentTuning from './SentimentTuning';

export default function GuardianSettings() {
    const { riskTolerance, emailEnabled, updateRiskTolerance, toggleEmail, loading } = useSettings();

    const options: { id: RiskTolerance; label: string; desc: string; icon: string; color: string }[] = [
        {
            id: 'conservative',
            label: 'Conservative',
            desc: 'Alert on -2.5% drops. High sensitivity.',
            icon: '🛡️',
            color: 'text-green-400 border-green-400/30 bg-green-900/10'
        },
        {
            id: 'moderate',
            label: 'Moderate',
            desc: 'Alert on -5.0% drops. Balanced.',
            icon: '⚖️',
            color: 'text-yellow-400 border-yellow-400/30 bg-yellow-900/10'
        },
        {
            id: 'aggressive',
            label: 'Aggressive',
            desc: 'Alert on -10.0% drops. Low noise.',
            icon: '🚀',
            color: 'text-red-400 border-red-400/30 bg-red-900/10'
        },
    ];

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                ⚙️ Guardian Sensitivity
            </h3>

            <div className="space-y-2">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => updateRiskTolerance(opt.id)}
                        disabled={loading}
                        className={`w-full text-left p-3 rounded-lg border transition flex items-center gap-3
                            ${riskTolerance === opt.id
                                ? `${opt.color} border-current ring-1 ring-current`
                                : 'border-slate-700 hover:bg-slate-800 text-gray-400'
                            }
                        `}
                    >
                        <span className="text-xl">{opt.icon}</span>
                        <div>
                            <div className={`font-bold text-sm ${riskTolerance === opt.id ? 'text-white' : ''}`}>
                                {opt.label}
                            </div>
                            <div className="text-xs opacity-80">
                                {opt.desc}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Email Toggle */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                    <div className="text-white font-bold text-sm">Email Alerts</div>
                    <div className="text-xs text-slate-500">Get notified when offline</div>
                </div>
                <button
                    onClick={toggleEmail}
                    disabled={loading}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${emailEnabled ? 'bg-cyan-600' : 'bg-slate-700'
                        }`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                </button>
            </div>

            <SentimentTuning />
        </div>
    );
}

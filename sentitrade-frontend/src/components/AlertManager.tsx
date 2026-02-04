import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';

export const AlertManager: React.FC = () => {
    const { preferences, history, updatePreference, loading } = useAlerts();
    const [activeTab, setActiveTab] = useState<'preferences' | 'history'>('preferences');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg">
                <div className="animate-spin h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg h-96 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">Alerts & Notifications</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-600">
                <button
                    onClick={() => setActiveTab('preferences')}
                    className={`px-4 py-2 font-semibold transition ${activeTab === 'preferences'
                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    Preferences
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 font-semibold transition ${activeTab === 'history'
                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    History ({history?.length || 0})
                </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
                {/* Preferences Tab */}
                {activeTab === 'preferences' && preferences && (
                    <div className="space-y-4">
                        {preferences.map((pref) => (
                            <div key={pref.preference_id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-gray-300 capitalize">{pref.alert_type}</span>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={pref.enabled}
                                            onChange={() => updatePreference(pref.preference_id, { enabled: !pref.enabled })}
                                            className="w-4 h-4"
                                        />
                                        <span className="ml-2 text-sm text-gray-400">
                                            {pref.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <span className="text-xs text-gray-400 block mb-1">Channels:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {pref.channels.map((channel) => (
                                                <span key={channel} className="px-2 py-1 text-xs bg-cyan-900/30 text-cyan-400 rounded">
                                                    {channel}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs text-gray-400 block mb-1">Threshold:</span>
                                        <span className="text-sm font-semibold text-yellow-400">{pref.threshold}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && history && (
                    <div className="space-y-2">
                        {history.length > 0 ? (
                            history.map((alert) => (
                                <div
                                    key={alert.alert_id}
                                    className={`p-3 rounded-lg border ${alert.read_at
                                            ? 'bg-slate-700/20 border-slate-600'
                                            : 'bg-cyan-900/20 border-cyan-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <span className="text-xs font-semibold text-cyan-400 capitalize">
                                                {alert.alert_type}
                                            </span>
                                            <p className="text-sm text-gray-300 mt-1">{alert.content}</p>
                                            <span className="text-xs text-gray-500 mt-1">
                                                {new Date(alert.sent_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="ml-2">
                                            <span className={`px-2 py-1 text-xs rounded ${alert.read_at
                                                    ? 'bg-gray-700 text-gray-400'
                                                    : 'bg-cyan-700 text-cyan-300'
                                                }`}>
                                                {alert.read_at ? '✓ Read' : 'New'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No alerts yet
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

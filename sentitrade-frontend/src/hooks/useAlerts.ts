import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

export interface AlertPreference {
    preference_id: string;
    alert_type: string;
    enabled: boolean;
    channels: string[];
    threshold: number;
}

export interface AlertHistoryItem {
    alert_id: string;
    alert_type: string;
    content: string;
    sent_at: string;
    read_at: string | null;
}

export const useAlerts = () => {
    const [preferences, setPreferences] = useState<AlertPreference[]>([]);
    const [history, setHistory] = useState<AlertHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prefsRes, historyRes] = await Promise.all([
                apiClient.get('/alert/preferences'),
                apiClient.get('/alert/history')
            ]);
            setPreferences(prefsRes.data.data);
            setHistory(historyRes.data.data);
        } catch (err) {
            console.error('Failed to fetch alerts data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updatePreference = async (id: string, updates: Partial<AlertPreference>) => {
        // Optimistic update
        setPreferences(prev => prev.map(p => p.preference_id === id ? { ...p, ...updates } : p));

        try {
            await apiClient.patch(`/alert/preferences/${id}`, updates);
        } catch (err) {
            console.error('Failed to update preference:', err);
            // Revert on error
            fetchData();
        }
    };

    return { preferences, history, updatePreference, loading, refetch: fetchData };
};

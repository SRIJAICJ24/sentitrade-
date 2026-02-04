import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useWebSocket } from './useWebSocket';

export interface Divergence {
    divergence_type: 'bullish' | 'bearish';
    sentiment_change_percent: number;
    price_change_percent: number;
    reversal_probability: number;
    historical_avg_profit: number;
    detected_at: string;
}

// Fallback mock data
const MOCK_DIVERGENCE: Divergence = {
    divergence_type: 'bullish',
    sentiment_change_percent: 15.2,
    price_change_percent: -3.8,
    reversal_probability: 72,
    historical_avg_profit: 8.5,
    detected_at: new Date().toISOString(),
};

export const useDivergence = () => {
    const [divergence, setDivergence] = useState<Divergence | null>(null);
    const [loading, setLoading] = useState(true);
    const { on, off } = useWebSocket();

    useEffect(() => {
        const fetchDivergence = async () => {
            try {
                const response = await apiClient.get('/price/divergence');
                setDivergence(response.data.data || MOCK_DIVERGENCE);
            } catch (err) {
                console.error('Failed to fetch divergence, using mock:', err);
                // Use mock data as fallback
                setDivergence(MOCK_DIVERGENCE);
            } finally {
                setLoading(false);
            }
        };

        fetchDivergence();

        const handleUpdate = (data: Divergence) => {
            setDivergence(data);
        };

        on('divergence:update', handleUpdate);

        return () => {
            off('divergence:update', handleUpdate);
        };
    }, [on, off]);

    return { divergence, loading };
};

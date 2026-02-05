import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useWebSocket } from './useWebSocket';

export interface Signal {
    signal_id: string;
    asset_code: string;
    action: 'BUY' | 'SELL';
    confidence: number;
    entry_price: number;
    stop_loss: number;
    take_profit: number;
    position_size_percent: number;
    risk_reward_ratio: number;
    expires_at: string;
    reasoning?: string;
    correlation?: number;
    patterns?: Array<{
        name: string;
        confidence: number;
        description: string;
        action: string;
    }>;
}

// Fallback mock signal when API is unavailable
const MOCK_SIGNAL: Signal = {
    signal_id: 'mock-signal-001',
    asset_code: 'BTC/USDT',
    action: 'BUY',
    confidence: 87,
    entry_price: 42850.50,
    stop_loss: 41500.00,
    take_profit: 45500.00,
    position_size_percent: 2.5,
    risk_reward_ratio: 1.96,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
};

export const useSignal = (asset?: string) => {
    const [signal, setSignal] = useState<Signal | null>(null);
    const [loading, setLoading] = useState(true);
    const { on, off } = useWebSocket();

    useEffect(() => {
        const fetchLatestSignal = async () => {
            setLoading(true); // Reset loading on asset change
            try {
                // Pass asset as query param if available
                const url = asset ? `/signal/latest?asset=${asset}` : '/signal/latest';
                const response = await apiClient.get(url);
                if (response.data.data) {
                    setSignal(response.data.data);
                } else {
                    // Use mock signal if no signal available
                    setSignal(MOCK_SIGNAL);
                }
            } catch (err: any) {
                console.warn('Failed to fetch signal, using mock:', err);
                // Use mock signal as fallback
                setSignal(MOCK_SIGNAL);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestSignal();

        const handleNewSignal = (newSignal: Signal) => {
            // Only update if signal matches current asset or general if undefined
            if (!asset || newSignal.asset_code === asset) {
                setSignal(newSignal);
            }
        };

        on('signal:new', handleNewSignal);

        return () => {
            off('signal:new', handleNewSignal);
        };
    }, [on, off, asset]); // Re-run when asset changes

    return { signal, loading };
};

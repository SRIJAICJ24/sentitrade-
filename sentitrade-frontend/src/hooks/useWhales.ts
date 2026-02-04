import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useWebSocket } from './useWebSocket';

export interface Whale {
    wallet_address: string;
    amount_usd: number;
    tx_type: 'accumulation' | 'distribution';
    timestamp: string;
    trust_score: number;
    whale_age_days: number;
    asset_code: string;
}

export interface SmartMoneyScore {
    conviction_score: number;
    bullish_percentage: number;
    bearish_percentage: number;
}

// Fallback mock data
const MOCK_WHALES: Whale[] = [
    {
        wallet_address: '0x742d...8f2a',
        amount_usd: 15420000,
        tx_type: 'accumulation',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        trust_score: 92,
        whale_age_days: 1245,
        asset_code: 'BTC',
    },
    {
        wallet_address: '0x8b3e...1c9d',
        amount_usd: 8750000,
        tx_type: 'distribution',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        trust_score: 78,
        whale_age_days: 890,
        asset_code: 'BTC',
    },
    {
        wallet_address: '0x1a5f...7e2b',
        amount_usd: 12300000,
        tx_type: 'accumulation',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        trust_score: 95,
        whale_age_days: 2100,
        asset_code: 'ETH',
    },
];

const MOCK_SMART_MONEY: SmartMoneyScore = {
    conviction_score: 78,
    bullish_percentage: 68,
    bearish_percentage: 32,
};

export const useWhales = () => {
    const [whales, setWhales] = useState<Whale[]>([]);
    const [smartMoneyScore, setSmartMoneyScore] = useState<SmartMoneyScore | null>(null);
    const [loading, setLoading] = useState(true);
    const { on, off } = useWebSocket();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [whalesRes, scoreRes] = await Promise.all([
                    apiClient.get('/whale/recent'),
                    apiClient.get('/whale/smart-money')
                ]);
                setWhales(whalesRes.data.data.transactions || []);
                const score = scoreRes.data.data;
                setSmartMoneyScore({
                    conviction_score: score.conviction_score,
                    bullish_percentage: score.whale_consensus_percent || 50,
                    bearish_percentage: 100 - (score.whale_consensus_percent || 50),
                });
            } catch (err) {
                console.error('Failed to fetch whale data, using mock:', err);
                // Use mock data as fallback
                setWhales(MOCK_WHALES);
                setSmartMoneyScore(MOCK_SMART_MONEY);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const handleTransaction = (tx: Whale) => {
            setWhales(prev => [tx, ...prev].slice(0, 50));
        };

        const handleScoreUpdate = (score: SmartMoneyScore) => {
            setSmartMoneyScore(score);
        };

        on('whale:transaction', handleTransaction);
        on('whale:score', handleScoreUpdate);

        return () => {
            off('whale:transaction', handleTransaction);
            off('whale:score', handleScoreUpdate);
        };
    }, [on, off]);

    return { whales, smartMoneyScore, loading };
};

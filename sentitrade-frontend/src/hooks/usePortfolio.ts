import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface PortfolioItem {
    id: number;
    ticker: string;
    quantity: number;
    buy_price: number;
    current_price: number;
    roi: number;
    roi_percent: number;
    added_at: string;
}

export interface PortfolioSummary {
    total_value: number;
    total_roi: number;
    total_roi_percent: number;
    items: PortfolioItem[];
}

export const usePortfolio = () => {
    const [summary, setSummary] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolio = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/portfolio');
            setSummary(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch portfolio:', err);
            setError('Failed to load portfolio');
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (ticker: string, quantity: number, buyPrice: number) => {
        try {
            await apiClient.post('/portfolio', {
                ticker,
                quantity,
                buy_price: buyPrice
            });
            await fetchPortfolio();
            return true;
        } catch (err) {
            console.error('Failed to add item:', err);
            throw err;
        }
    };

    const removeItem = async (id: number) => {
        try {
            await apiClient.delete(`/portfolio/${id}`);
            await fetchPortfolio();
        } catch (err) {
            console.error('Failed to remove item:', err);
        }
    };

    useEffect(() => {
        fetchPortfolio();
        const interval = setInterval(fetchPortfolio, 30000);
        return () => clearInterval(interval);
    }, []);

    return { summary, loading, error, addItem, removeItem, refresh: fetchPortfolio };
};

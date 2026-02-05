/**
 * Sovereign Data Service
 * Connects to the Sovereign Multi-Asset Data Pipeline
 * Provides hooks for quotes, history, and live data
 */

import { apiClient } from './client';

// Types
export interface QuoteData {
    asset: string;
    price: number;
    change_pc: number;
    type: 'NSE' | 'CRYPTO' | 'COMMODITY' | 'UNKNOWN';
    currency: string;
    sentiment: number;
    is_mock: boolean;
    source?: string;
    timestamp?: string;
}

export interface HistoryCandle {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface HistoryResponse {
    success: boolean;
    ticker: string;
    type: string;
    days_requested: number;
    count: number;
    data: HistoryCandle[];
}

/**
 * Fetch real-time quote for any asset
 */
export async function getQuote(ticker: string): Promise<QuoteData> {
    try {
        const res = await apiClient.get(`/history/quote/${ticker}`);
        return res.data;
    } catch (error) {
        console.error(`[DataService] Quote error for ${ticker}:`, error);
        // Return mock data on error
        return {
            asset: ticker,
            price: 0,
            change_pc: 0,
            type: 'UNKNOWN',
            currency: 'USD',
            sentiment: 0.5,
            is_mock: true,
        };
    }
}

/**
 * Fetch historical OHLC data for charting
 */
export async function getHistory(ticker: string, days: number = 180): Promise<HistoryCandle[]> {
    try {
        const res = await apiClient.get<HistoryResponse>(`/history/${ticker}?days=${days}`);
        if (res.data.success && res.data.data) {
            return res.data.data;
        }
        return [];
    } catch (error) {
        console.error(`[DataService] History error for ${ticker}:`, error);
        return [];
    }
}

/**
 * Fetch all latest cached data from the polling loop
 */
export async function getLatestAll(): Promise<Record<string, QuoteData>> {
    try {
        const res = await apiClient.get('/history/latest');
        if (res.data.success) {
            return res.data.data;
        }
        return {};
    } catch (error) {
        console.error('[DataService] Latest data error:', error);
        return {};
    }
}

/**
 * Detect asset type from ticker string
 */
export function detectAssetType(ticker: string): 'NSE' | 'CRYPTO' | 'COMMODITY' | 'UNKNOWN' {
    const upper = ticker.toUpperCase();

    // Crypto patterns
    const cryptoSymbols = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOT', 'DOGE', 'MATIC'];
    if (cryptoSymbols.some(c => upper.includes(c))) return 'CRYPTO';
    if (upper.includes('-USD') || upper.includes('/USD')) return 'CRYPTO';

    // Commodity patterns
    const commoditySymbols = ['GC=F', 'SI=F', 'GOLD', 'SILVER', 'CRUDE'];
    if (commoditySymbols.some(c => upper.includes(c))) return 'COMMODITY';

    // NSE patterns
    if (upper.includes('.NS') || upper.includes('.BO')) return 'NSE';

    // Default to NSE for Indian stocks
    return 'NSE';
}

/**
 * Format price based on currency
 */
export function formatPrice(value: number, currency: string = 'USD'): string {
    if (currency === 'INR') {
        // Indian locale formatting
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format percentage change with sign
 */
export function formatChange(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

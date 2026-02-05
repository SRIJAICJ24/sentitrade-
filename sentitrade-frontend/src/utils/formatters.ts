/**
 * SentiTrade Pro - Precision Formatters
 * Enforces strict 2-decimal precision and Indian Numbering System where applicable.
 */

// Format numbers with strict 2 decimal places
export const formatNumber = (value: number, decimals: number = 2): string => {
    if (value === undefined || value === null) return '--';
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

// Format Currency: Handles USD (billions/millions) vs INR (Lakhs/Crores)
export const formatCurrency = (value: number, currency: 'USD' | 'INR'): string => {
    if (value === undefined || value === null) return '--';

    if (currency === 'INR') {
        // Indian System (Lakhs/Crores)
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(value);
    } else {
        // US System (Millions/Billions default)
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2,
        }).format(value);
    }
};

// Compact Number Formatter (e.g., 1.2M, 500k) - useful for charts/cards
export const formatCompact = (value: number, currency: 'USD' | 'INR'): string => {
    if (currency === 'INR') {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString('en-IN')}`;
    }
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'USD'
    }).format(value);
};

import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export const useSettings = () => {
    const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [sentimentWeights, setSentimentWeights] = useState({ news: 1.0, twitter: 1.0, reddit: 1.0 });
    const [loading, setLoading] = useState(false);

    const fetchSettings = async () => {
        try {
            const response = await apiClient.get('/settings');
            setRiskTolerance(response.data.risk_tolerance);
            setEmailEnabled(response.data.email_notifications);
            if (response.data.sentiment_weights && Object.keys(response.data.sentiment_weights).length > 0) {
                setSentimentWeights(response.data.sentiment_weights);
            }
        } catch (err) {
            console.error('Failed to fetch settings');
        }
    };

    const updateSettings = async (risk: RiskTolerance, email: boolean, weights: any) => {
        setLoading(true);
        try {
            await apiClient.put('/settings', {
                risk_tolerance: risk,
                email_notifications: email,
                sentiment_weights: weights
            });
            setRiskTolerance(risk);
            setEmailEnabled(email);
            setSentimentWeights(weights);
        } catch (err) {
            console.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const updateRiskTolerance = (level: RiskTolerance) => updateSettings(level, emailEnabled, sentimentWeights);
    const toggleEmail = () => updateSettings(riskTolerance, !emailEnabled, sentimentWeights);
    const updateWeights = (newWeights: any) => updateSettings(riskTolerance, emailEnabled, newWeights);

    // Initial fetch
    useEffect(() => {
        fetchSettings();
    }, []);

    return { riskTolerance, emailEnabled, sentimentWeights, updateRiskTolerance, toggleEmail, updateWeights, loading };


};

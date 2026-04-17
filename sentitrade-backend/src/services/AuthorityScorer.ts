import { logger } from "../utils/logger";

export interface SocialSignal {
    text: string;
    source: 'twitter' | 'reddit' | 'stocktwits';
    authorFollowers: number;
    accountAgeDays: number;
    postEngagement: number;
    isVerified: boolean;
    rawSentiment: number; // -1 to +1
}

export interface WeightedScore {
    asset: string;
    weightedScore: number;
    rawSignalCount: number;
    highAuthorityCount: number;
    lowAuthorityCount: number;
    suspicionFlag: boolean;
    topSignals: SocialSignal[];
}

export function calculateAuthorityWeight(signal: SocialSignal): number {
    let weight = 1.0;

    if (signal.isVerified) weight *= 2.5;
    if (signal.authorFollowers > 100000) weight *= 2.0;
    else if (signal.authorFollowers > 10000) weight *= 1.5;

    if (signal.accountAgeDays < 30) weight *= 0.2; // Suspicious new account penalty
    else if (signal.accountAgeDays < 90) weight *= 0.5;

    if (signal.postEngagement > 1000) weight *= 1.3;

    // Cap and Floor
    return Math.max(0.1, Math.min(5.0, weight));
}

export function calculateWeightedScore(asset: string, signals: SocialSignal[]): WeightedScore {
    if (signals.length === 0) {
        return {
            asset,
            weightedScore: 50,
            rawSignalCount: 0,
            highAuthorityCount: 0,
            lowAuthorityCount: 0,
            suspicionFlag: false,
            topSignals: []
        };
    }

    let totalContribution = 0;
    let totalWeight = 0;
    let lowAgeCount = 0;
    let highAuthorityCount = 0;
    let lowAuthorityCount = 0;

    // Attach weights to signals for sorting later
    const weightedSignals = signals.map(signal => {
        const weight = calculateAuthorityWeight(signal);
        
        if (signal.accountAgeDays < 30) lowAgeCount++;
        if (weight >= 2.0) highAuthorityCount++;
        if (weight <= 0.5) lowAuthorityCount++;

        totalContribution += signal.rawSentiment * weight;
        totalWeight += weight;

        return { ...signal, _computedWeight: weight };
    });

    const averageSentiment = totalContribution / totalWeight; // between -1 and +1

    // Normalize to 0-100 scale
    const normalizedScore = Math.min(100, Math.max(0, (averageSentiment + 1) * 50));

    // Flag if > 40% are new accounts
    const suspicionFlag = (lowAgeCount / signals.length) > 0.4;

    // Sort to get top signals
    weightedSignals.sort((a, b) => b._computedWeight - a._computedWeight);
    const topSignals = weightedSignals.slice(0, 5).map(({ _computedWeight, ...rest }) => rest);

    return {
        asset,
        weightedScore: Number(normalizedScore.toFixed(2)),
        rawSignalCount: signals.length,
        highAuthorityCount,
        lowAuthorityCount,
        suspicionFlag,
        topSignals
    };
}

export function generateMockSignals(asset: string, count: number): SocialSignal[] {
    const signals: SocialSignal[] = [];
    const sources: ('twitter'|'reddit'|'stocktwits')[] = ['twitter', 'reddit', 'stocktwits'];
    
    for (let i = 0; i < count; i++) {
        // Generate heavily random realistic values
        const isBot = Math.random() < 0.15; // 15% chance to represent bot
        
        signals.push({
            text: `Generated mock signal for ${asset} ${Math.random().toString(36).substring(7)}`,
            source: sources[Math.floor(Math.random() * sources.length)],
            authorFollowers: isBot ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 250000),
            accountAgeDays: isBot ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 2000),
            postEngagement: Math.floor(Math.random() * 5000),
            isVerified: !isBot && Math.random() < 0.1,
            rawSentiment: (Math.random() * 2) - 1 // -1 to 1
        });
    }

    return signals;
}

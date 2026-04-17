import { randomUUID } from "crypto";

export interface GeospatialSignal {
    type: 'ais_reroute' | 'infrastructure_outage' | 'geopolitical_alert' | 'port_closure';
    region: string;
    severity: 1 | 2 | 3;
    affectedCommodities: string[];
    description: string;
    timestamp: number;
}

export interface BlackSwanAlert {
    id: string;
    triggerSignal: GeospatialSignal;
    affectedAssets: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    estimatedImpact: string;
    confidence: number;
    timestamp: number;
}

const COMMODITY_MAP: Record<string, string[]> = {
    "oil": ["XOM", "CVX", "OIL", "USO"],
    "gas": ["LNG", "UNG", "BP"],
    "semiconductors": ["NVDA", "TSM", "AMD", "QCOM"],
    "shipping": ["ZIM", "DAC", "MATX"],
    "gold": ["GLD", "GOLD", "NEM"]
};

export function detectBlackSwan(signals: GeospatialSignal[]): BlackSwanAlert[] {
    const alerts: BlackSwanAlert[] = [];
    
    // Sort signals descending by timestamp to process the newest first
    const sortedSignals = [...signals].sort((a, b) => b.timestamp - a.timestamp);

    const severity2Tracker: Record<string, GeospatialSignal[]> = {};

    for (const signal of sortedSignals) {
        if (signal.severity === 3) {
            alerts.push(generateAlert(signal));
        } else if (signal.severity === 2) {
            if (!severity2Tracker[signal.region]) {
                severity2Tracker[signal.region] = [];
            }
            severity2Tracker[signal.region].push(signal);
            
            // Check for 2+ signals in same region within 3600 seconds
            const recentSignals = severity2Tracker[signal.region].filter(
                s => (signal.timestamp - s.timestamp) <= 3600000 // Compare milliseconds (req says 3600s, assume ms internally)
            );

            if (recentSignals.length >= 2) {
                // To avoid duplicate clustering, clear out the tracker for this region
                severity2Tracker[signal.region] = [];
                alerts.push(generateAlert(signal));
            }
        }
    }

    return alerts;
}

function generateAlert(triggerSignal: GeospatialSignal): BlackSwanAlert {
    let affectedAssets: string[] = [];
    triggerSignal.affectedCommodities.forEach(commodity => {
        if (COMMODITY_MAP[commodity]) {
            affectedAssets = [...affectedAssets, ...COMMODITY_MAP[commodity]];
        }
    });

    const uniqueAssets = Array.from(new Set(affectedAssets));

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (triggerSignal.severity === 3) riskLevel = 'critical';
    else if (triggerSignal.severity === 2 && uniqueAssets.length > 5) riskLevel = 'high';

    const topAsset = uniqueAssets[0] || 'VARIOUS ASSETS';
    const estimatedImpact = `${triggerSignal.description} may push ${topAsset} +/- ${Math.floor(Math.random() * 5 + 3)}% in 24h.`;

    return {
        id: randomUUID(),
        triggerSignal,
        affectedAssets: uniqueAssets,
        riskLevel,
        estimatedImpact,
        confidence: Math.floor(Math.random() * 20 + 75), // 75-95
        timestamp: Date.now()
    };
}

// Scenarios
export const SCENARIOS: Record<string, GeospatialSignal> = {
    "1": {
        type: "ais_reroute",
        region: "Strait of Hormuz",
        severity: 3,
        affectedCommodities: ["oil"],
        description: "AIS signals indicate 5+ VLCC tankers executing emergency U-turn protocols.",
        timestamp: Date.now()
    },
    "2": {
        type: "infrastructure_outage",
        region: "US-EAST-1",
        severity: 3,
        affectedCommodities: ["semiconductors"],
        description: "Severely degraded networking in core datacenter backbone.",
        timestamp: Date.now()
    },
    "3": {
        type: "port_closure",
        region: "Taiwan",
        severity: 3,
        affectedCommodities: ["semiconductors", "shipping"],
        description: "Force majeure port closure declared due to geopolitical friction.",
        timestamp: Date.now()
    }
};

let currentMocks: BlackSwanAlert[] = [];

export function getCurrentAlerts(): BlackSwanAlert[] {
    return currentMocks;
}

export function simulateScenario(scenarioId: '1' | '2' | '3'): BlackSwanAlert | null {
    const signal = SCENARIOS[scenarioId];
    if (!signal) return null;

    signal.timestamp = Date.now(); // update timestamp
    
    // Pass it directly through to trigger an alert
    const newAlerts = detectBlackSwan([signal]);
    if (newAlerts.length > 0) {
        currentMocks.unshift(newAlerts[0]);
        // Keep only top 10
        currentMocks = currentMocks.slice(0, 10);
        return newAlerts[0];
    }
    return null;
}

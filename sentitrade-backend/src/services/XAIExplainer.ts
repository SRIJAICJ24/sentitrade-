import { ExplanationResult } from "../types";
import { runCouncil } from "../agents/AgentCouncil";
import { calculateWeightedScore, generateMockSignals, calculateAuthorityWeight } from "./AuthorityScorer";
import { getCurrentAlerts } from "./BlackSwanDetector";
import { logger } from "../utils/logger";

export async function explainSignal(asset: string): Promise<ExplanationResult> {
    try {
        // Run Agent Council
        const councilResult = await runCouncil(asset);
        
        // Compute Sentiment
        const mockSignals = generateMockSignals(asset, 50);
        const sentimentResult = calculateWeightedScore(asset, mockSignals);

        // Calculate normalized weights based on agent confidences
        let socialW = councilResult.socialVerdict.confidence;
        let macroW = councilResult.macroVerdict.confidence;
        let guardianW = 100 - councilResult.guardianResult.botProbability; // Inverse of bot probability
        
        // Check for active Black Swans
        const activeSwans = getCurrentAlerts().filter(alert => alert.affectedAssets.includes(asset));
        let geospatialW = activeSwans.length > 0 ? 50 : 0; // High impact if affected

        const totalW = socialW + macroW + guardianW + geospatialW;
        
        const socialWeight = Math.round((socialW / totalW) * 100) || 45;
        const macroWeight = Math.round((macroW / totalW) * 100) || 30;
        const geospatialWeight = Math.round((geospatialW / totalW) * 100) || 15;
        const guardianWeight = 100 - (socialWeight + macroWeight + geospatialWeight);

        // Build Breakdown Array
        const breakdown = [
            { type: "Social", weight: socialWeight, color: "#7F77DD" },
            { type: "Macro", weight: macroWeight, color: "#1D9E75" },
            { type: "Geospatial", weight: geospatialWeight, color: "#BA7517" },
            { type: "Guardian", weight: guardianWeight, color: "#639922" }
        ];

        // Format Sources from Top Signals
        const sources = sentimentResult.topSignals.slice(0, 3).map(sig => ({
            text: sig.text,
            authority: calculateAuthorityWeight(sig) >= 2.0 ? "High" : "Medium" as 'High' | 'Medium' | 'Low',
            age: `${sig.accountAgeDays}d account`,
            source: sig.source.toUpperCase()
        }));

        const result: ExplanationResult = {
            asset,
            score: sentimentResult.weightedScore,
            breakdown,
            sources,
            agentVerdicts: {
                macro: councilResult.macroVerdict.verdict,
                social: councilResult.socialVerdict.verdict,
                guardian: councilResult.guardianResult.isSuspicious ? "bear" : "bull",
                executioner: councilResult.executionerProposal.action === "BUY" ? "bull" :
                             councilResult.executionerProposal.action === "SELL" ? "bear" : "neutral"
            }
        };

        return result;

    } catch (error) {
        logger.error("XAI Explainer failed", { error, asset });
        throw error;
    }
}

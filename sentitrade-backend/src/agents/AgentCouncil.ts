import { CouncilResult, GuardianSignal } from "../types";
import { runMacroMinister } from "./MacroMinister";
import { runSocialMinister } from "./SocialMinister";
import { runGuardianAgent } from "./GuardianAgent";
import { runExecutionerAgent } from "./ExecutionerAgent";
import { broadcast } from "../utils/broadcast";
import { logger } from "../utils/logger";

export async function runCouncil(asset: string): Promise<CouncilResult> {
    // Mock Inputs
    const macroInput = { interestRate: 5.25, inflationRate: 3.2, yieldCurve10Y2Y: 0.15 };
    const socialInput = { redditMentions: 4200, tweetVolume: 18500, avgSentimentScore: 0.72, topKeywords: ["moon", "earnings", "beat"] };
    const guardianInput: GuardianSignal[] = [
        { text: "Buy $SPY now before it's too late", source: "reddit", authorFollowers: 12, accountAge: 2 },
        { text: "Buy $SPY now before it's too late", source: "twitter", authorFollowers: 5, accountAge: 1 },
        { text: "Long term hold setup looking great", source: "stocktwits", authorFollowers: 450, accountAge: 365 },
        { text: "Algorithm detected massive inflow", source: "twitter", authorFollowers: 18000, accountAge: 1200 },
        { text: "Buy $SPY now before it's too late", source: "reddit", authorFollowers: 0, accountAge: 1 }
    ];

    try {
        const [macroVerdict, socialVerdict, guardianResult] = await Promise.all([
            runMacroMinister(macroInput),
            runSocialMinister(socialInput),
            runGuardianAgent(guardianInput)
        ]);

        const executionerProposal = await runExecutionerAgent({
            macroVerdict,
            socialVerdict,
            guardianResult,
            asset
        });

        const result: CouncilResult = {
            asset,
            macroVerdict,
            socialVerdict,
            guardianResult,
            executionerProposal,
            timestamp: Date.now()
        };

        // Broadcast to all websocket clients
        broadcast({
            type: "COUNCIL_RESULT",
            timestamp: Date.now(),
            data: result
        });

        return result;
    } catch (error) {
        logger.error("AgentCouncil run failed", { error, asset });
        throw error; // Let caller index.ts catch it
    }
}

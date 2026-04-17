import { GuardianResult, GuardianSignal } from "../types";
import { runJsonModel } from "../utils/openai";
import { logger } from "../utils/logger";

const SYSTEM_PROMPT = `
You are the Guardian Agent, a cybersecurity AI that detects coordinated manipulation 
and bot activity in financial social media. Look for patterns: sudden volume spikes 
from new accounts, repeated identical phrases, suspicious posting patterns.
Return ONLY JSON: 
{ 
  "isSuspicious": boolean, 
  "botProbability": 0-100, 
  "flags": ["string array of suspicion reasons"] 
}
`;

export async function runGuardianAgent(
    signals: GuardianSignal[]
): Promise<GuardianResult> {
    try {
        const result = await runJsonModel<GuardianResult>(
            "gpt-4o-mini",
            SYSTEM_PROMPT,
            { signals }
        );
        return result;
    } catch (error) {
        logger.error("GuardianAgent failed", { error });
        return {
            isSuspicious: false,
            botProbability: 0,
            flags: ["Agent unavailable"]
        };
    }
}

import { ExecutionerInput, ExecutionerResult } from "../types";
import { runJsonModel } from "../utils/openai";
import { logger } from "../utils/logger";

const SYSTEM_PROMPT = `
You are the Executioner Agent. Given verdicts from the Macro Minister, Social Minister,
and Guardian Agent, produce a dry-run trade proposal. If Guardian flags suspicious data,
reduce confidence significantly (e.g. by 40%).
Return ONLY JSON: 
{ 
  "action": "BUY" | "SELL" | "HOLD", 
  "confidence": 0-100, 
  "positionSize": "small" | "medium" | "large", 
  "reasoning": "string (max 120 chars)",
  "warningFlags": ["string array"] 
}
`;

export async function runExecutionerAgent(
    input: ExecutionerInput
): Promise<ExecutionerResult> {
    try {
        const result = await runJsonModel<ExecutionerResult>(
            "gpt-4o-mini",
            SYSTEM_PROMPT,
            input
        );
        return result;
    } catch (error) {
        logger.error("ExecutionerAgent failed", { error });
        return {
            action: "HOLD",
            confidence: 0,
            positionSize: "small",
            reasoning: "Agent unavailable",
            warningFlags: ["Executioner Offline"]
        };
    }
}

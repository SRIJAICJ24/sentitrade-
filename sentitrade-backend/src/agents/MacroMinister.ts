import { MinisterVerdict } from "../types";
import { runJsonModel } from "../utils/openai";
import { logger } from "../utils/logger";

const SYSTEM_PROMPT = `
You are the Macro Minister, a specialized financial analyst focused on macroeconomic indicators. 
Analyze the provided data and return ONLY a JSON object:
{
  "verdict": "bull" | "bear" | "neutral",
  "confidence": 0-100,
  "reason": "string (max 80 chars)"
}
`;

export async function runMacroMinister(
    macroData: { interestRate: number; inflationRate: number; yieldCurve10Y2Y: number }
): Promise<MinisterVerdict> {
    try {
        const result = await runJsonModel<MinisterVerdict>(
            "gpt-4o-mini",
            SYSTEM_PROMPT,
            macroData
        );
        return result;
    } catch (error) {
        logger.error("MacroMinister failed", { error });
        return {
            verdict: "neutral",
            confidence: 0,
            reason: "Agent unavailable"
        };
    }
}

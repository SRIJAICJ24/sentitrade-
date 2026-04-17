import { MinisterVerdict } from "../types";
import { runJsonModel } from "../utils/openai";
import { logger } from "../utils/logger";

const SYSTEM_PROMPT = `
You are the Social Minister, analyzing retail investor sentiment from social media.
Return ONLY JSON: 
{ 
  "verdict": "bull" | "bear" | "neutral", 
  "confidence": 0-100, 
  "reason": "string (max 80 chars)" 
}
`;

export async function runSocialMinister(
    socialData: { redditMentions: number; tweetVolume: number; avgSentimentScore: number; topKeywords: string[] }
): Promise<MinisterVerdict> {
    try {
        const result = await runJsonModel<MinisterVerdict>(
            "gpt-4o-mini",
            SYSTEM_PROMPT,
            socialData
        );
        return result;
    } catch (error) {
        logger.error("SocialMinister failed", { error });
        return {
            verdict: "neutral",
            confidence: 0,
            reason: "Agent unavailable"
        };
    }
}

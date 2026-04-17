import { Router, Request, Response } from "express";
import { generateMockSignals, calculateWeightedScore } from "../services/AuthorityScorer";
import { broadcast } from "../utils/broadcast";
import { logger } from "../utils/logger";

export const sentimentRouter = Router();

sentimentRouter.get("/sentiment/:asset", (req: Request, res: Response) => {
    const { asset } = req.params;
    
    try {
        const signals = generateMockSignals(asset, 50);
        const weightedScore = calculateWeightedScore(asset, signals);

        // Broadcast to websocket clients
        broadcast({
            type: "AUTHORITY_SCORE",
            timestamp: Date.now(),
            data: weightedScore
        });

        res.json(weightedScore);
    } catch (error) {
        logger.error("Error generating sentiment score", { error, asset });
        res.status(500).json({ error: "Failed to generate sentiment score" });
    }
});

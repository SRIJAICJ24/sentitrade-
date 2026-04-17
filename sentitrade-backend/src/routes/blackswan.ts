import { Router, Request, Response } from "express";
import { getCurrentAlerts, simulateScenario } from "../services/BlackSwanDetector";
import { broadcast } from "../utils/broadcast";
import { logger } from "../utils/logger";

export const blackSwanRouter = Router();

blackSwanRouter.get("/blackswan", (_req: Request, res: Response) => {
    res.json(getCurrentAlerts());
});

blackSwanRouter.post("/blackswan/simulate", (req: Request, res: Response) => {
    const { scenario } = req.body;

    if (!scenario || !['1', '2', '3'].includes(String(scenario))) {
        res.status(400).json({ error: "Invalid scenario. Please provide 1, 2, or 3." });
        return;
    }

    try {
        const alert = simulateScenario(String(scenario) as '1' | '2' | '3');

        if (alert) {
            broadcast({
                type: "BLACK_SWAN_ALERT",
                timestamp: Date.now(),
                data: alert
            });
            res.json({ message: "Scenario executed safely", alert });
        } else {
            res.status(500).json({ error: "Failed to generate alert from scenario" });
        }
    } catch (error) {
        logger.error("Simulation failed", { error });
        res.status(500).json({ error: "Simulation failed" });
    }
});

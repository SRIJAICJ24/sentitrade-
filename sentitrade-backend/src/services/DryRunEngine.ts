import { randomUUID } from "crypto";
import { DryRunProposal, ExecutionerResult } from "../types";

export function proposeTrade(asset: string, executionerResult: ExecutionerResult): DryRunProposal {
    const mockPriceEntry = Number((Math.random() * 500 + 50).toFixed(2));
    
    let mockStopLoss = 0;
    let mockTakeProfit = 0;

    if (executionerResult.action === 'BUY') {
        mockStopLoss = Number((mockPriceEntry * 0.95).toFixed(2));
        mockTakeProfit = Number((mockPriceEntry * 1.12).toFixed(2));
    } else if (executionerResult.action === 'SELL') {
        mockStopLoss = Number((mockPriceEntry * 1.05).toFixed(2));
        mockTakeProfit = Number((mockPriceEntry * 0.88).toFixed(2));
    } else {
        // HOLD
        mockStopLoss = mockPriceEntry;
        mockTakeProfit = mockPriceEntry;
    }

    let mockShares = 0;
    if (executionerResult.positionSize === 'small') mockShares = 10;
    else if (executionerResult.positionSize === 'medium') mockShares = 50;
    else if (executionerResult.positionSize === 'large') mockShares = 200;

    const riskScore = Math.round((1 - (executionerResult.confidence / 100)) * 100);

    return {
        id: randomUUID(),
        asset,
        action: executionerResult.action,
        mockShares,
        mockPriceEntry,
        mockStopLoss,
        mockTakeProfit,
        reasoning: executionerResult.reasoning,
        riskScore,
        warningFlags: executionerResult.warningFlags,
        timestamp: Date.now()
    };
}

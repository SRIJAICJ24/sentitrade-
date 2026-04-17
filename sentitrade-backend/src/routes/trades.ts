import { Router, Request, Response } from "express";

// A simple ephemeral in-memory storage array matching the Step 5 requirement
// "Store last 10 proposals in memory (simple array) and expose GET /api/trades/history"
const tradeProposalsHistory: any[] = [];

export const tradesRouter = Router();

tradesRouter.get("/trades/history", (_req: Request, res: Response) => {
    res.json(tradeProposalsHistory);
});

// Since the websocket handles actual generation via DRY_TRADE_PROPOSAL, 
// we simply expose an interceptor array or we can just return this empty mock 
// for now unless we directly export the array to index.ts. 
// Let's export it effectively:
export function recordTradeProposal(proposal: any) {
    tradeProposalsHistory.unshift(proposal);
    if (tradeProposalsHistory.length > 10) {
        tradeProposalsHistory.pop();
    }
}

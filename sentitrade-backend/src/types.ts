export type Verdict = "bull" | "bear" | "neutral";

export interface MinisterVerdict {
  verdict: Verdict;
  confidence: number;
  reason: string;
}

export interface GuardianSignal {
  text: string;
  source: string;
  authorFollowers: number;
  accountAge: number;
}

export interface GuardianResult {
  isSuspicious: boolean;
  botProbability: number;
  flags: string[];
}

export interface ExecutionerInput {
  macroVerdict: MinisterVerdict;
  socialVerdict: MinisterVerdict;
  guardianResult: GuardianResult;
  asset: string;
}

export interface ExecutionerResult {
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  positionSize: "small" | "medium" | "large";
  reasoning: string;
  warningFlags: string[];
}

export interface CouncilResult {
  asset: string;
  macroVerdict: MinisterVerdict;
  socialVerdict: MinisterVerdict;
  guardianResult: GuardianResult;
  executionerProposal: ExecutionerResult;
  timestamp: number;
}

export interface BreakdownItem {
  type: string;
  weight: number;
  color: string;
}

export interface SourceItem {
  text: string;
  authority: "High" | "Medium" | "Low";
  age: string;
  source: string;
}

export interface AgentVerdicts {
  macro: Verdict;
  social: Verdict;
  guardian: Verdict;
  executioner: Verdict;
}

export interface ExplanationResult {
  asset: string;
  score: number;
  breakdown: BreakdownItem[];
  sources: SourceItem[];
  agentVerdicts: AgentVerdicts;
}

export interface DryRunProposal {
  id: string;
  asset: string;
  action: "BUY" | "SELL" | "HOLD";
  mockShares: number;
  mockPriceEntry: number;
  mockStopLoss: number;
  mockTakeProfit: number;
  reasoning: string;
  riskScore: number;
  warningFlags: string[];
  timestamp: number;
}

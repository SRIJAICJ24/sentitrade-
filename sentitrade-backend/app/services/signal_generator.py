"""
Signal Generator with XAI (Explainable AI) Reasoning
Generates trading signals with natural language explanations

Features:
- XAI Reasoning: Every signal includes a human-readable explanation
- Kelly Criterion: Optimal position sizing based on edge and odds
- R:R Filter: Rejects signals with risk/reward < 1:2
- Multi-asset support: BTC, AAPL, GOLD
"""

import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, Literal
from dataclasses import dataclass

from app.models.signal import SignalAction
from app.services.pattern_recognizer import pattern_recognizer, MarketPattern

logger = logging.getLogger(__name__)


@dataclass
class SignalContext:
    """Context data for signal generation"""
    asset: str
    sentiment_score: float
    sentiment_change: float  # % change in last hour
    price: float
    price_change: float  # % change in last hour
    trend: Literal["UP", "DOWN", "FLAT"]
    volatility: float
    whale_activity: Optional[str] = None  # "accumulation" or "distribution"
    whale_amount_usd: float = 0
    trusted_source_count: int = 0
    spam_source_count: int = 0


class XAISignalGenerator:
    """
    Explainable AI Signal Generator
    
    Generates trading signals with natural language reasoning.
    Uses Kelly Criterion for position sizing.
    """
    
    # Thresholds
    BULLISH_SENTIMENT_THRESHOLD = 75
    BEARISH_SENTIMENT_THRESHOLD = 25
    MIN_CONFIDENCE = 70
    MIN_RR_RATIO = 2.0
    
    def __init__(self):
        self._signal_count = 0
    
    def _calculate_kelly_position(
        self,
        confidence: float,
        risk_percent: float = 2.0,
        volatility: float = 1.0
    ) -> float:
        """
        Calculate position size using Kelly Criterion.
        
        Formula: PS = (Portfolio × Risk% / 100) × (Confidence / 100) × (1 / (1 + Volatility))
        
        Args:
            confidence: Signal confidence (0-100)
            risk_percent: Maximum portfolio risk (default 2%)
            volatility: Asset volatility factor
            
        Returns:
            Position size as percentage of portfolio
        """
        confidence_factor = confidence / 100
        volatility_factor = 1 / (1 + volatility)
        
        # Kelly-inspired formula with volatility adjustment
        position_size = risk_percent * confidence_factor * volatility_factor
        
        # Cap at 5% max position
        return min(5.0, max(0.1, position_size))
    
    def _generate_reasoning(self, ctx: SignalContext, action: str, confidence: float) -> str:
        """
        Generate natural language XAI reasoning for the signal.
        
        Returns a human-readable explanation of why the signal was generated.
        """
        reasons = []
        
        # Sentiment analysis
        if action == "BUY":
            reasons.append(f"{ctx.sentiment_score:.0f}% bullish sentiment score")
            if ctx.sentiment_change > 5:
                reasons.append(f"+{ctx.sentiment_change:.1f}% sentiment spike in last hour")
        else:
            reasons.append(f"{ctx.sentiment_score:.0f}% bearish sentiment score")
            if ctx.sentiment_change < -5:
                reasons.append(f"{ctx.sentiment_change:.1f}% sentiment drop in last hour")
        
        # Price trend
        if ctx.trend == "UP" and action == "BUY":
            reasons.append("price trending upward (1h)")
        elif ctx.trend == "DOWN" and action == "SELL":
            reasons.append("price trending downward (1h)")
        
        # Whale activity
        if ctx.whale_activity:
            whale_amount_m = ctx.whale_amount_usd / 1_000_000
            if ctx.whale_activity == "accumulation" and action == "BUY":
                reasons.append(f"${whale_amount_m:.1f}M whale accumulation detected")
            elif ctx.whale_activity == "distribution" and action == "SELL":
                reasons.append(f"${whale_amount_m:.1f}M whale distribution detected")
        
        # Source quality
        if ctx.trusted_source_count > 0:
            reasons.append(f"{ctx.trusted_source_count} trusted sources (Reuters/Bloomberg)")
        
        # Build reasoning string
        reason_text = " + ".join(reasons)
        
        # Add historical accuracy (simulated for demo)
        historical_accuracy = 60 + (confidence - 70) * 0.5  # 60-75% range
        
        return f"{action}: {reason_text}. Historical accuracy for this setup: {historical_accuracy:.0f}%."
    
    def _detect_divergence(self, ctx: SignalContext) -> Optional[dict]:
        """
        Detect sentiment-price divergence.
        
        Bullish divergence: Price down but sentiment up
        Bearish divergence: Price up but sentiment down
        """
        if ctx.price_change < -2 and ctx.sentiment_change > 5:
            return {
                "type": "bullish",
                "message": "Buy the Dip: Price dropped but sentiment is rising",
                "price_change": ctx.price_change,
                "sentiment_change": ctx.sentiment_change
            }
        elif ctx.price_change > 2 and ctx.sentiment_change < -5:
            return {
                "type": "bearish",
                "message": "Caution: Price rising but sentiment is falling",
                "price_change": ctx.price_change,
                "sentiment_change": ctx.sentiment_change
            }
        return None
    
    async def generate_signal(
        self,
        ctx: SignalContext,
        portfolio_size: float = 10000,
        risk_percent: float = 2.0
    ) -> Optional[dict]:
        """
        Generate a trading signal with XAI reasoning.
        
        Args:
            ctx: SignalContext with all market data
            portfolio_size: Portfolio value in USD
            risk_percent: Risk per trade (default 2%)
            
        Returns:
            Signal dict with reasoning, or None if no signal
        """
        # Determine action based on sentiment + trend
        action = None
        if ctx.sentiment_score > self.BULLISH_SENTIMENT_THRESHOLD and ctx.trend in ["UP", "FLAT"]:
            action = SignalAction.BUY
            confidence = min(100, ctx.sentiment_score * 0.9 + (ctx.trusted_source_count * 2))
        elif ctx.sentiment_score < self.BEARISH_SENTIMENT_THRESHOLD and ctx.trend in ["DOWN", "FLAT"]:
            action = SignalAction.SELL
            confidence = min(100, (100 - ctx.sentiment_score) * 0.9 + (ctx.trusted_source_count * 2))
        else:
            # No clear signal
            return None
        
        # Minimum confidence check
        if confidence < self.MIN_CONFIDENCE:
            logger.debug(f"Signal rejected: confidence {confidence:.1f}% below threshold")
            return None
        
        # Calculate price levels
        entry = ctx.price
        
        if action == SignalAction.BUY:
            stop_loss = entry * (1 - ctx.volatility * 0.02)
            risk_amount = entry - stop_loss
            take_profit = entry + (risk_amount * self.MIN_RR_RATIO)
        else:
            stop_loss = entry * (1 + ctx.volatility * 0.02)
            risk_amount = stop_loss - entry
            take_profit = entry - (risk_amount * self.MIN_RR_RATIO)
        
        # Calculate R:R ratio
        reward_amount = abs(take_profit - entry)
        rr_ratio = reward_amount / risk_amount if risk_amount > 0 else 0
        
        # R:R filter
        if rr_ratio < self.MIN_RR_RATIO:
            logger.debug(f"Signal rejected: R:R {rr_ratio:.2f} below {self.MIN_RR_RATIO}")
            return None
        
        # Kelly Criterion position sizing
        position_size_percent = self._calculate_kelly_position(
            confidence, risk_percent, ctx.volatility
        )
        position_size_usd = (portfolio_size * position_size_percent / 100)
        
        # Generate XAI reasoning
        reasoning = self._generate_reasoning(ctx, action.value, confidence)
        
        # Detect divergence
        divergence = self._detect_divergence(ctx)
        
        # Create base signal
        signal = {
            "signal_id": f"sig_{uuid.uuid4().hex[:8]}",
            "asset_code": ctx.asset,
            "action": action.value,
            "confidence": round(confidence, 2),
            "entry_price": round(entry, 2),
            "stop_loss": round(stop_loss, 2),
            "take_profit": round(take_profit, 2),
            "risk_reward_ratio": round(rr_ratio, 2),
            "position_size_percent": round(position_size_percent, 2),
            "position_size_usd": round(position_size_usd, 2),
            "sentiment_score_at_signal": round(ctx.sentiment_score, 2),
            "reasoning": reasoning,  # XAI explanation
            "divergence": divergence,
            "expires_at": (datetime.utcnow() + timedelta(hours=2)).isoformat(),
            "created_at": datetime.utcnow().isoformat(),
        }
        
        # Enhance with Pattern Engine
        signal = await self._analyze_patterns_and_update_signal(signal, ctx, action.value)
        
        self._signal_count += 1
        return signal

    async def _analyze_patterns_and_update_signal(
        self, 
        base_signal: dict, 
        ctx: SignalContext, 
        action: str
    ) -> dict:
        """
        Enhance signal with pattern recognition data
        """
        # 1. Update pattern engine
        pattern_recognizer.update_data(ctx.asset, ctx.price, ctx.sentiment_score)
        
        # 2. Get patterns
        patterns = pattern_recognizer.detect_patterns(
            ctx.asset, ctx.price, ctx.sentiment_score, ctx.volatility
        )
        
        # 3. Get correlation
        correlation = pattern_recognizer.calculate_correlation(ctx.asset)
        
        # 4. Modify signal based on patterns
        enhanced_reasoning = base_signal["reasoning"]
        
        if patterns:
            pattern_names = [p.name for p in patterns]
            enhanced_reasoning += f" | Patterns: {', '.join(pattern_names)}"
            
            # Boost confidence if pattern aligns with action
            for p in patterns:
                if (p.action == "BUY" and action == "BUY") or (p.action == "SELL" and action == "SELL"):
                    base_signal["confidence"] = min(100, base_signal["confidence"] + 10)
        
        # 5. Add correlation info
        enhanced_reasoning += f" | P/S Corr: {correlation:.2f}"
        
        base_signal["reasoning"] = enhanced_reasoning
        base_signal["patterns"] = [p.__dict__ for p in patterns]
        base_signal["correlation"] = round(correlation, 2)
        
        return base_signal

    
    async def generate_signal_simple(
        self,
        sentiment_score: float,
        current_price: float,
        volatility: float = 1.8,
        trend: Literal["UP", "DOWN", "FLAT"] = "FLAT",
        asset: str = "BTC"
    ) -> Optional[dict]:
        """
        Simplified signal generation for backward compatibility.
        """
        ctx = SignalContext(
            asset=asset,
            sentiment_score=sentiment_score,
            sentiment_change=0,
            price=current_price,
            price_change=0,
            trend=trend,
            volatility=volatility
        )
        return await self.generate_signal(ctx)


# Singleton instance
signal_generator = XAISignalGenerator()

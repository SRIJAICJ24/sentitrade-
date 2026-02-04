import math
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class MarketPattern:
    name: str
    confidence: float
    description: str
    action: str # BUY, SELL, HOLD, ALERT

class PatternRecognizer:
    """
    Advanced Quantitative Analysis Engine.
    Detects market anomalies by analyzing the correlation between Price and Sentiment.
    """
    
    def __init__(self):
        # Rolling window history for correlation (last 50 data points)
        # Structure: { "BTC-USD": { "prices": [], "sentiments": [] } }
        self._history: Dict[str, Dict[str, List[float]]] = {}
        self._window_size = 50

    def update_data(self, asset: str, price: float, sentiment: float):
        """Ingest new data point for an asset"""
        if asset not in self._history:
            self._history[asset] = {"prices": [], "sentiments": []}
            
        self._history[asset]["prices"].append(price)
        self._history[asset]["sentiments"].append(sentiment)
        
        # Trim to window size
        if len(self._history[asset]["prices"]) > self._window_size:
            self._history[asset]["prices"].pop(0)
            self._history[asset]["sentiments"].pop(0)

    def calculate_correlation(self, asset: str) -> float:
        """
        Calculate Pearson Correlation Coefficient (-1 to 1).
        -1: Perfect negative correlation (Divergence)
        0: No correlation
        1: Perfect positive correlation
        """
        data = self._history.get(asset)
        if not data or len(data["prices"]) < 10:
            return 0.0
            
        try:
            return self._pearson_correlation(data["prices"], data["sentiments"])
        except Exception as e:
            logger.error(f"Correlation calc error: {e}")
            return 0.0

    def detect_patterns(self, asset: str, current_price: float, current_sentiment: float, volatility: float) -> List[MarketPattern]:
        """
        Identify sophisticated trading setups based on data confluence.
        """
        patterns = []
        correlation = self.calculate_correlation(asset)
        
        # 1. Hype Squeeze (Price UP, Sentiment Sky High, Volatility Low -> High)
        # Danger of a "sell the news" event
        if current_sentiment > 80 and correlation > 0.8:
            patterns.append(MarketPattern(
                name="Euphorical Top",
                confidence=0.85,
                description="Extreme sentiment + price alignment. Risk of reversal.",
                action="SELL"
            ))

        # 2. Silent Accumulation (Price Rising, Sentiment Neutral/Low)
        # Smart money buying without retail hype
        if self._is_trend_up(self._history[asset]["prices"]) and current_sentiment < 55 and current_sentiment > 45:
             patterns.append(MarketPattern(
                name="Silent Accumulation",
                confidence=0.75,
                description="Price rising on neutral sentiment. Smart money accumulation suspected.",
                action="BUY"
            ))
            
        # 3. Panic Bottom (Price Flat/Down, Sentiment < 20)
        # Retail capitulation
        if current_sentiment < 20 and volatility > 0.02:
             patterns.append(MarketPattern(
                name="Panic Bottom",
                confidence=0.6,
                description="Extreme fear detected. Potential contrarian entry.",
                action="is_watching"
            ))

        # 4. Bearish Divergence (Price UP, Sentiment DOWN)
        # The classic "Trap"
        if correlation < -0.6 and self._is_trend_up(self._history[asset]["prices"]):
             patterns.append(MarketPattern(
                name="Bearish Divergence",
                confidence=0.9,
                description="Price making highs while Sentiment makes lows. CRITICAL WARNING.",
                action="ALERT"
            ))

        return patterns

    def _pearson_correlation(self, x: List[float], y: List[float]) -> float:
        """Pure Python Pearson Implementation (No numpy dep for zero-key edge)"""
        n = len(x)
        if n != len(y) or n == 0:
            return 0.0
            
        mean_x = sum(x) / n
        mean_y = sum(y) / n
        
        numerator = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
        
        sum_sq_diff_x = sum((xi - mean_x) ** 2 for xi in x)
        sum_sq_diff_y = sum((yi - mean_y) ** 2 for yi in y)
        
        denominator = math.sqrt(sum_sq_diff_x * sum_sq_diff_y)
        
        if denominator == 0:
            return 0.0
            
        return numerator / denominator
        
    def _is_trend_up(self, prices: List[float]) -> bool:
        """Simple linear regression slope check"""
        if len(prices) < 5: return False
        return prices[-1] > prices[0] # Very naive, but fast

# Singleton
pattern_recognizer = PatternRecognizer()

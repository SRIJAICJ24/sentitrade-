import logging
import random

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """
    Mock FinBERT sentiment analyzer.
    In production, replace with actual FinBERT model loading.
    For hackathon, we use mock data for reliability.
    """
    def __init__(self):
        logger.info("✅ SentimentAnalyzer initialized (mock mode)")
    
    async def analyze_text(self, text: str) -> dict:
        """Analyze sentiment of text (mock implementation)"""
        try:
            # Mock sentiment based on keywords
            text_lower = text.lower()
            
            positive_keywords = ["bullish", "amazing", "breaks", "strong", "resilience", "accumulates", "positive", "up", "moon", "pump"]
            negative_keywords = ["bearish", "crash", "dump", "sell", "fear", "panic", "down", "weak"]
            
            positive_count = sum(1 for kw in positive_keywords if kw in text_lower)
            negative_count = sum(1 for kw in negative_keywords if kw in text_lower)
            
            if positive_count > negative_count:
                base_score = 65 + random.uniform(0, 25)
                label = "bullish"
            elif negative_count > positive_count:
                base_score = 25 + random.uniform(0, 25)
                label = "bearish"
            else:
                base_score = 45 + random.uniform(0, 20)
                label = "neutral"
            
            confidence = 60 + random.uniform(0, 30)
            
            # Apply weight adjustments
            weight = self._calculate_weight(text)
            final_score = min(100, max(0, base_score * weight))
            
            return {
                "score": round(final_score, 2),
                "confidence": round(confidence, 2),
                "label": label,
            }
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {
                "score": 50,
                "confidence": 0,
                "label": "neutral",
            }
    
    def _calculate_weight(self, text: str) -> float:
        """Apply keyword-based weighting"""
        negative_keywords = ["100x", "giveaway", "telegram", "rugpull", "airdrop"]
        positive_keywords = ["reuters", "bloomberg", "ap news", "verified"]
        
        weight = 1.0
        text_lower = text.lower()
        
        for keyword in negative_keywords:
            if keyword in text_lower:
                weight *= 0.5
        
        for keyword in positive_keywords:
            if keyword in text_lower:
                weight *= 1.5
        
        return max(0.1, min(2.0, weight))

# Global instance
sentiment_analyzer = SentimentAnalyzer()

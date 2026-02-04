"""
FinBERT Local Sentiment Analysis Service
Uses ProsusAI/finbert model for financial text classification
"""

import logging
from typing import Optional
from functools import lru_cache

logger = logging.getLogger(__name__)

# Lazy-load model to avoid startup delay
_pipeline = None


def get_finbert_pipeline():
    """Lazy-load the FinBERT model on first use"""
    global _pipeline
    if _pipeline is None:
        logger.info("🧠 Loading FinBERT model (first time may take 30-60 seconds)...")
        try:
            from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
            from app.config import settings
            
            model_name = settings.finbert_model
            cache_dir = settings.finbert_cache_dir
            
            # Load model and tokenizer
            tokenizer = AutoTokenizer.from_pretrained(model_name, cache_dir=cache_dir)
            model = AutoModelForSequenceClassification.from_pretrained(model_name, cache_dir=cache_dir)
            
            _pipeline = pipeline(
                "sentiment-analysis",
                model=model,
                tokenizer=tokenizer,
                truncation=True,
                max_length=512
            )
            logger.info("✅ FinBERT model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load FinBERT: {e}")
            _pipeline = None
    return _pipeline


class FinBERTService:
    """
    Local FinBERT sentiment analysis service.
    
    Returns sentiment labels: 'positive', 'negative', 'neutral'
    with confidence scores from 0-1.
    """
    
    def __init__(self):
        self._ready = False
    
    async def ensure_ready(self) -> bool:
        """Check if model is loaded and ready, attempting to load if not"""
        if self._ready and _pipeline is not None:
            return True
            
        # Trigger loading if not started
        self.trigger_loading()
        
        # Check status without waiting
        self._ready = _pipeline is not None
        return self._ready
        
    def trigger_loading(self):
        """Start loading in background without awaiting"""
        global _pipeline
        if _pipeline is not None:
            return
            
        import threading
        # Use a simple thread to avoid asyncio complexity with fire-and-forget
        if not hasattr(self, '_loading_thread') or not self._loading_thread.is_alive():
            self._loading_thread = threading.Thread(target=get_finbert_pipeline, daemon=True)
            self._loading_thread.start()
            logger.info("🧵 FinBERT loading thread started")
    
    def analyze(self, text: str) -> dict:
        """
        Analyze sentiment of financial text.
        
        Args:
            text: Financial headline or text to analyze
            
        Returns:
            {
                "label": "positive" | "negative" | "neutral",
                "score": 0.0-1.0,
                "raw_score": original model score
            }
        """
        pipeline = get_finbert_pipeline()
        
        if pipeline is None:
            logger.warning("FinBERT not available, returning neutral")
            return {
                "label": "neutral",
                "score": 0.5,
                "raw_score": 0.5
            }
        
        try:
            result = pipeline(text)[0]
            label = result["label"].lower()
            score = result["score"]
            
            # Normalize score to 0-100 sentiment scale
            if label == "positive":
                normalized_score = 50 + (score * 50)  # 50-100
            elif label == "negative":
                normalized_score = 50 - (score * 50)  # 0-50
            else:  # neutral
                normalized_score = 50
            
            return {
                "label": label,
                "score": round(normalized_score, 2),
                "raw_score": round(score, 4)
            }
        except Exception as e:
            logger.error(f"FinBERT analysis error: {e}")
            return {
                "label": "neutral",
                "score": 50.0,
                "raw_score": 0.5
            }
    
    def analyze_batch(self, texts: list[str]) -> list[dict]:
        """Analyze multiple texts in batch for efficiency"""
        pipeline = get_finbert_pipeline()
        
        if pipeline is None:
            return [{"label": "neutral", "score": 50.0, "raw_score": 0.5} for _ in texts]
        
        try:
            results = pipeline(texts)
            analyzed = []
            for result in results:
                label = result["label"].lower()
                score = result["score"]
                
                if label == "positive":
                    normalized_score = 50 + (score * 50)
                elif label == "negative":
                    normalized_score = 50 - (score * 50)
                else:
                    normalized_score = 50
                
                analyzed.append({
                    "label": label,
                    "score": round(normalized_score, 2),
                    "raw_score": round(score, 4)
                })
            return analyzed
        except Exception as e:
            logger.error(f"FinBERT batch analysis error: {e}")
            return [{"label": "neutral", "score": 50.0, "raw_score": 0.5} for _ in texts]


# Singleton instance
finbert_service = FinBERTService()

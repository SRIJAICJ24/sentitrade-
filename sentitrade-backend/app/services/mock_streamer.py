"""
Mock Data Streamer Service
Streams headlines from seed_data.json for sentiment analysis
"""

import json
import random
import logging
import asyncio
from pathlib import Path
from datetime import datetime
from typing import List, Optional

from app.config import settings
# finbert_service imported lazily in analyze_headlines to not block startup
from app.services.source_purity import apply_source_purity, get_aggregate_sentiment

logger = logging.getLogger(__name__)


class MockDataStreamer:
    """
    Streams financial headlines from seed_data.json.
    Processes through FinBERT + Source Purity algorithm.
    """
    
    def __init__(self):
        self._headlines: List[dict] = []
        self._current_index = 0
        self._loaded = False
    
    def load_seed_data(self) -> bool:
        """Load headlines from seed_data.json"""
        try:
            data_path = Path(__file__).parent.parent / "data" / "seed_data.json"
            
            if not data_path.exists():
                logger.error(f"Seed data not found at {data_path}")
                return False
            
            with open(data_path, "r", encoding="utf-8") as f:
                self._headlines = json.load(f)
            
            logger.info(f"✅ Loaded {len(self._headlines)} headlines from seed_data.json")
            self._loaded = True
            return True
        except Exception as e:
            logger.error(f"Failed to load seed data: {e}")
            return False
    
    def get_random_headlines(self, count: int = 5, asset: Optional[str] = None) -> List[dict]:
        """
        Get random headlines for processing.
        
        Args:
            count: Number of headlines to return
            asset: Filter by asset (BTC, AAPL, GOLD) or None for all
        """
        if not self._loaded:
            self.load_seed_data()
        
        if not self._headlines:
            return []
        
        filtered = self._headlines
        if asset:
            filtered = [h for h in self._headlines if h.get("asset") == asset]
        
        return random.sample(filtered, min(count, len(filtered)))
    
    def get_next_batch(self, batch_size: int = 5) -> List[dict]:
        """Get next batch of headlines in sequence (for reproducible streaming)"""
        if not self._loaded:
            self.load_seed_data()
        
        if not self._headlines:
            return []
        
        batch = []
        for _ in range(batch_size):
            batch.append(self._headlines[self._current_index])
            self._current_index = (self._current_index + 1) % len(self._headlines)
        
        return batch
    
    async def analyze_headlines(self, headlines: List[dict]) -> dict:
        """
        Analyze headlines through FinBERT + Source Purity.
        
        Returns:
            {
                "timestamp": ISO timestamp,
                "headlines_analyzed": processed headline data,
                "aggregate": aggregate sentiment data,
                "by_asset": per-asset breakdown
            }
        """
        if not headlines:
            return {"error": "No headlines to analyze"}
        
        # Lazy import to not block startup
        from app.services.finbert_service import finbert_service
        
        # Run FinBERT analysis on all headlines
        texts = [h.get("headline", "") for h in headlines]
        sentiments = finbert_service.analyze_batch(texts)
        
        # Apply Source Purity to each result
        analyzed = []
        for headline_data, sentiment in zip(headlines, sentiments):
            purity_result = apply_source_purity(
                sentiment["score"],
                headline_data.get("source", ""),
                headline_data.get("headline", "")
            )
            
            analyzed.append({
                "id": headline_data.get("id"),
                "asset": headline_data.get("asset"),
                "headline": headline_data.get("headline"),
                "source": headline_data.get("source"),
                "finbert_label": sentiment["label"],
                "finbert_score": sentiment["score"],
                "weighted_score": purity_result["weighted_score"],
                "source_weight": purity_result["weight"],
                "source_category": purity_result["source_category"],
            })
        
        # Aggregate by asset
        by_asset = {}
        for item in analyzed:
            asset = item["asset"]
            if asset not in by_asset:
                by_asset[asset] = []
            by_asset[asset].append({
                "headline": item["headline"],
                "source": item["source"],
                "sentiment_score": item["weighted_score"]
            })
        
        asset_aggregates = {}
        for asset, items in by_asset.items():
            asset_aggregates[asset] = get_aggregate_sentiment(items)
        
        # Overall aggregate
        all_items = [
            {
                "headline": item["headline"],
                "source": item["source"],
                "sentiment_score": item["weighted_score"]
            }
            for item in analyzed
        ]
        overall = get_aggregate_sentiment(all_items)
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "headlines_analyzed": analyzed,
            "aggregate": overall,
            "by_asset": asset_aggregates
        }
    
    async def stream_sentiment(self, ws_manager, interval_seconds: int = 5):
        """
        Continuously stream sentiment updates via WebSocket.
        
        Args:
            ws_manager: WebSocketManager instance
            interval_seconds: Seconds between updates
        """
        logger.info(f"🔄 Starting sentiment stream (every {interval_seconds}s)")
        
        while True:
            try:
                # Get random batch of headlines
                headlines = self.get_random_headlines(count=5)
                
                # Analyze through FinBERT + Source Purity
                result = await self.analyze_headlines(headlines)
                
                # Broadcast to all connected clients
                await ws_manager.broadcast({
                    "type": "sentiment_update",
                    "data": result
                })
                
                logger.debug(f"Streamed sentiment: {result['aggregate']['aggregate_score']}")
                
            except Exception as e:
                logger.error(f"Stream error: {e}")
            
            await asyncio.sleep(interval_seconds)


# Singleton instance
mock_streamer = MockDataStreamer()

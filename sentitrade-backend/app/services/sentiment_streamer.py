"""
Enhanced Sentiment Streamer with FinBERT + Source Purity
Streams AI "thoughts" for the Senti-Quant Console
"""

import asyncio
import random
import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.models.sentiment import Sentiment
from app.services.finbert_service import finbert_service
from app.services.source_purity import apply_source_purity, get_aggregate_sentiment
from app.services.mock_streamer import mock_streamer
from app.services.market_data import market_data_service
from app.services.signal_generator import signal_generator, SignalContext
from app.ws.manager import WebSocketManager
from app.config import settings

logger = logging.getLogger(__name__)


class EnhancedSentimentStreamer:
    """
    Enhanced sentiment streamer with:
    - Local FinBERT analysis
    - Source Purity weighting
    - Multi-asset support
    - AI "thoughts" for Senti-Quant Console
    - Signal generation with XAI
    """
    
    def __init__(self, session_maker: async_sessionmaker, ws_manager: WebSocketManager):
        self.session_maker = session_maker
        self.ws_manager = ws_manager
        self._running = False
        self._thoughts_log: List[dict] = []
    
    def _log_thought(self, thought: str, level: str = "info", asset: Optional[str] = None):
        """Log an AI thought for the console"""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "thought": thought,
            "level": level,  # info, success, warning, error
            "asset": asset
        }
        self._thoughts_log.append(entry)
        
        # Keep last 100 thoughts
        if len(self._thoughts_log) > 100:
            self._thoughts_log = self._thoughts_log[-100:]
        
        return entry
    
    async def _broadcast_thought(self, thought: str, level: str = "info", asset: Optional[str] = None):
        """Broadcast thought to all connected clients"""
        entry = self._log_thought(thought, level, asset)
        await self.ws_manager.broadcast({
            "type": "ai_thought",
            "data": entry
        })
    
    async def stream_continuously(self):
        """Main streaming loop - runs every 5 seconds"""
        self._running = True
        logger.info("🧠 Starting Enhanced Sentiment Streamer with FinBERT...")
        
        # Ensure seed data is loaded
        if not mock_streamer._loaded:
            mock_streamer.load_seed_data()
        
        await self._broadcast_thought("🚀 Senti-Quant AI initializing...", "info")
        await self._broadcast_thought("📊 Loading FinBERT sentiment model...", "info")
        
        # Trigger FinBERT loading (fire and forget)
        await finbert_service.ensure_ready()
        await self._broadcast_thought("⏳ FinBERT initializing in background...", "info")
        
        iteration = 0
        
        while self._running:
            try:
                iteration += 1
                await self._process_iteration(iteration)
                await asyncio.sleep(settings.stream_interval_seconds)
                
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                await self._broadcast_thought(f"⚠️ Error: {str(e)[:50]}", "error")
                await asyncio.sleep(settings.stream_interval_seconds)
    
    async def _process_iteration(self, iteration: int):
        """Process one streaming iteration"""
        
        # Get random headlines
        headlines = mock_streamer.get_random_headlines(count=5)
        
        if not headlines:
            await self._broadcast_thought("📭 No headlines available", "warning")
            return
        
        # Announce processing
        assets = list(set(h.get("asset", "BTC") for h in headlines))
        await self._broadcast_thought(
            f"🔍 Analyzing {len(headlines)} headlines for {', '.join(assets)}...",
            "info"
        )
        
        # Analyze through FinBERT + Source Purity if ready
        is_ready = await finbert_service.ensure_ready()
        
        if is_ready:
            result = await mock_streamer.analyze_headlines(headlines)
        else:
             # Fallback to mock analysis while loading
             await self._broadcast_thought("🧠 AI still warming up, using heuristic estimates...", "warning")
             # Add mock 'finbert_label' to headlines so the rest of the code works
             for h in headlines:
                 h["finbert_label"] = random.choice(["neutral", "positive", "negative"])
             
             # Create mock result structure
             result = {
                 "headlines_analyzed": [{
                     **h, 
                     "source_category": "trusted", 
                     "weighted_score": 50,
                     "finbert_label": h["finbert_label"]
                 } for h in headlines],
                 "aggregate": {"aggregate_score": 50, "trusted_count": 0, "spam_count": 0},
                 "by_asset": {asset: {"aggregate_score": 50} for asset in assets}
             }
        
        # Log individual analysis
        for item in result.get("headlines_analyzed", [])[:3]:  # Show top 3
            source_emoji = "🏛️" if item["source_category"] == "trusted" else ("⚠️" if item["source_category"] == "spam" else "📰")
            sentiment_emoji = "🟢" if item["finbert_label"] == "positive" else ("🔴" if item["finbert_label"] == "negative" else "⚪")
            
            await self._broadcast_thought(
                f"{source_emoji} [{item['source']}] {sentiment_emoji} {item['finbert_label'].upper()} ({item['weighted_score']:.0f})",
                "info",
                item["asset"]
            )
        
        # Save to database and broadcast
        async with self.session_maker() as session:
            aggregate = result.get("aggregate", {})
            
            # Calculate source breakdown from headlines
            sources = {"twitter": {"count": 0, "quality": 0}, "reddit": {"count": 0, "quality": 0}, 
                       "news": {"count": 0, "quality": 0}, "discord": {"count": 0, "quality": 0}}
            
            for item in result.get("headlines_analyzed", []):
                source_lower = item.get("source", "").lower()
                if "reuters" in source_lower or "bloomberg" in source_lower:
                    sources["news"]["count"] += 1
                    sources["news"]["quality"] = max(sources["news"]["quality"], int(item["weighted_score"]))
                elif "twitter" in source_lower:
                    sources["twitter"]["count"] += 1
                    sources["twitter"]["quality"] = max(sources["twitter"]["quality"], int(item["weighted_score"]))
                elif "reddit" in source_lower:
                    sources["reddit"]["count"] += 1
                    sources["reddit"]["quality"] = max(sources["reddit"]["quality"], int(item["weighted_score"]))
                else:
                    sources["discord"]["count"] += 1
                    sources["discord"]["quality"] = max(sources["discord"]["quality"], int(item["weighted_score"]))
            
            sentiment_score = aggregate.get("aggregate_score", 50)
            bullish_count = len([h for h in result.get("headlines_analyzed", []) if h["finbert_label"] == "positive"])
            bearish_count = len([h for h in result.get("headlines_analyzed", []) if h["finbert_label"] == "negative"])
            
            sentiment_obj = Sentiment(
                sentiment_score=round(sentiment_score, 2),
                bullish_count=bullish_count * 1000,
                bearish_count=bearish_count * 1000,
                confidence=round(min(95, sentiment_score * 0.9 + aggregate.get("trusted_count", 0) * 5), 2),
                sources=sources,
            )
            
            session.add(sentiment_obj)
            await session.commit()
            await session.refresh(sentiment_obj)
            
            # Broadcast sentiment update
            await self.ws_manager.broadcast({
                "type": "sentiment:update",
                "data": {
                    "sentiment_score": sentiment_obj.sentiment_score,
                    "bullish_count": sentiment_obj.bullish_count,
                    "bearish_count": sentiment_obj.bearish_count,
                    "confidence": sentiment_obj.confidence,
                    "sources": sentiment_obj.sources,
                    "updated_at": sentiment_obj.created_at.isoformat() if sentiment_obj.created_at else datetime.utcnow().isoformat(),
                    "by_asset": result.get("by_asset", {}),
                },
                "timestamp": datetime.utcnow().isoformat(),
            })
            
            # Log aggregate
            score_emoji = "🟢" if sentiment_score > 60 else ("🔴" if sentiment_score < 40 else "🟡")
            await self._broadcast_thought(
                f"{score_emoji} Aggregate sentiment: {sentiment_score:.1f}% (trusted: {aggregate.get('trusted_count', 0)}, spam: {aggregate.get('spam_count', 0)})",
                "success" if sentiment_score > 70 or sentiment_score < 30 else "info"
            )
        
        # Try to generate signals for each asset
        await self._try_generate_signals(result)
    
    async def _try_generate_signals(self, sentiment_result: dict):
        """Try to generate trading signals based on sentiment data"""
        
        by_asset = sentiment_result.get("by_asset", {})
        
        for asset, asset_data in by_asset.items():
            try:
                # Map asset names to yfinance symbols
                symbol_map = {"BTC": "BTC-USD", "AAPL": "AAPL", "GOLD": "GC=F"}
                symbol = symbol_map.get(asset, "BTC-USD")
                
                # Get market data
                price_data = await market_data_service.get_price(symbol)
                trend = await market_data_service.get_1h_trend(symbol)
                volatility = await market_data_service.get_volatility(symbol)
                
                if not price_data.get("success"):
                    continue
                
                # Build signal context
                ctx = SignalContext(
                    asset=asset,
                    sentiment_score=asset_data.get("aggregate_score", 50),
                    sentiment_change=random.uniform(-3, 8),  # Simulated for demo
                    price=price_data.get("price", 0),
                    price_change=price_data.get("change", 0),
                    trend=trend,
                    volatility=volatility,
                    trusted_source_count=asset_data.get("trusted_count", 0),
                    spam_source_count=asset_data.get("spam_count", 0)
                )
                
                # Generate signal
                signal = await signal_generator.generate_signal(ctx)
                
                if signal:
                    # Broadcast signal
                    await self.ws_manager.broadcast({
                        "type": "signal:new",
                        "data": signal
                    })
                    
                    # Log to console
                    action_emoji = "🟢 BUY" if signal["action"] == "BUY" else "🔴 SELL"
                    await self._broadcast_thought(
                        f"🎯 SIGNAL: {action_emoji} {asset} @ ${signal['entry_price']:,.2f} | Conf: {signal['confidence']:.0f}%",
                        "success",
                        asset
                    )
                    await self._broadcast_thought(
                        f"💡 {signal['reasoning']}",
                        "info",
                        asset
                    )
                    
            except Exception as e:
                logger.error(f"Signal generation error for {asset}: {e}")
    
    def stop(self):
        """Stop the streaming loop"""
        self._running = False


# For backward compatibility
SentimentStreamer = EnhancedSentimentStreamer

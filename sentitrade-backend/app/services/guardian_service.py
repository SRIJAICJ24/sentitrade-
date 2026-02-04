import asyncio
import logging
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.portfolio import PortfolioItem, PortfolioAlert
from app.models.user import User
from app.models.sentiment import Sentiment
from app.services.market_data import market_data_service
from app.services.finbert_service import finbert_service
from app.services.notification_service import notification_service
from app.ws.manager import WebSocketManager
from app.services.pattern_recognizer import pattern_recognizer

logger = logging.getLogger(__name__)

class GuardianService:
    """
    Background service that monitors user portfolios.
    - Checks live prices vs buy prices (ROI)
    - Checks sentiment for specific assets
    - Generates alerts if thresholds are breached
    """
    
    def __init__(self, session_maker: async_sessionmaker, ws_manager: WebSocketManager):
        self.session_maker = session_maker
        self.ws_manager = ws_manager
        self._running = False
        self._task = None
        
    async def start(self):
        """Start the guardian loop"""
        self._running = True
        self._task = asyncio.create_task(self._monitor_loop())
        logger.info("🛡️ Portfolio Guardian Service started")
        
    async def stop(self):
        """Stop the guardian loop"""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("🛡️ Portfolio Guardian Service stopped")
        
    async def _monitor_loop(self):
        """Main monitoring loop"""
        # Wait for system to warm up
        await asyncio.sleep(10)
        
        while self._running:
            try:
                logger.info("🛡️ Guardian scanning portfolios...")
                await self._scan_portfolios()
                # Scan every 5 minutes (300s) - using 30s for demo
                await asyncio.sleep(30)
            except Exception as e:
                logger.error(f"Guardian error: {e}")
                await asyncio.sleep(30)
                
    async def _scan_portfolios(self):
        """Scan all user portfolios for risks"""
        async with self.session_maker() as session:
            # Get all portfolio items with user data
            result = await session.execute(
                select(PortfolioItem).options(selectinload(PortfolioItem.user))
            )
            items = result.scalars().all()
            
            if not items:
                return
                
            # Group by ticker to batch process
            tickers = set(item.ticker for item in items)
            
            # 1. Fetch live prices
            prices = await market_data_service.get_prices(list(tickers))
            
            # 2. Analyze sentiment (mocked for specific tickers if not in main stream)
            # In a real app, we'd fetch specific news. Here we use the global sentiment
            # or mock specific sentiment for the asset
            
            for item in items:
                ticker = item.ticker
                price_data = prices.get(ticker, {})
                current_price = price_data.get("price", 0)
                
                if current_price <= 0:
                    continue
                    
                # Calculate ROI
                roi_percent = ((current_price - item.buy_price) / item.buy_price) * 100
                
                # Risk Logic based on User Tolerance
                risk_tolerance = item.user.risk_tolerance if item.user else "moderate"
                
                # Thresholds
                if risk_tolerance == "conservative":
                    stop_loss = -5.0
                    warning = -2.5
                elif risk_tolerance == "aggressive":
                    stop_loss = -15.0
                    warning = -8.0
                else: # moderate
                    stop_loss = -10.0
                    warning = -5.0

                if roi_percent < stop_loss:
                    severity = "critical"
                    message = f"🚨 STOP LOSS ALERT ({risk_tolerance}): {ticker} is down {roi_percent:.1f}%. Recommend EXIT."
                    alert_generated = True
                elif roi_percent < warning:
                    severity = "warning"
                    message = f"⚠️ Risk Warning ({risk_tolerance}): {ticker} is falling ({roi_percent:.1f}%). Watch closely."
                    alert_generated = True
                    message = f"🚀 Profit Alert: {ticker} is up {roi_percent:.1f}%! Consider taking profits."
                    alert_generated = True
                
                # Sentiment Stop-Loss (Dynamic Exit)
                # Check for "Sentiment Crash" using Pattern Recognizer history
                # If sentiment drops > 40 points (e.g. 80 -> 40) in the recent window
                sentiment_drop = self._check_sentiment_crash(ticker)
                if sentiment_drop > 40:
                     severity = "critical"
                     message = f"📉 SENTIMENT CRASH: {ticker} sentiment dropped {sentiment_drop:.0f} pts! AI recommends IMMEDIATE EXIT."
                     alert_generated = True
                     
                if alert_generated:
                    # Save alert
                    alert = PortfolioAlert(
                        portfolio_item_id=item.id,
                        message=message,
                        severity=severity
                    )
                    session.add(alert)
                    await session.commit()
                    
                    # Notify User via WebSocket
                    await self.ws_manager.send_to_user(
                        str(item.user_id),
                        {
                            "type": "guardian:alert",
                            "data": {
                                "id": alert.id,
                                "ticker": ticker,
                                "message": message,
                                "severity": severity,
                                "timestamp": alert.created_at.isoformat()
                            }
                        }
                    )
                    logger.info(f"🛡️ Sent alert to user {item.user_id} for {ticker}")
                    
                    # Send Email (if enabled)
                    if item.user and item.user.email_notifications:
                        asyncio.create_task(
                            notification_service.send_email(
                                recipient=item.user.email,
                                subject=f"SentiTrade Alert: {ticker} ({severity.upper()})",
                                body=f"Guardian AI has detected an event:\n\n{message}\n\nCurrent ROI: {roi_percent:.2f}%\nTarget Price: ${current_price}\n\nLogin to dashboard for action."
                            )
                        )


# Singleton placeholder (initialized in main.py)
guardian_service = None

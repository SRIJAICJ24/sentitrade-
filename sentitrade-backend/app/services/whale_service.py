import asyncio
import logging
import random
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import async_sessionmaker
from app.models.whale import WhaleActivity, TxType
from app.services.market_data import market_data_service
from app.ws.manager import WebSocketManager

logger = logging.getLogger(__name__)

class WhaleService:
    """
    Simulates Whale Activity based on market volatility.
    """
    
    def __init__(self, session_maker: async_sessionmaker, ws_manager: WebSocketManager):
        self.session_maker = session_maker
        self.ws_manager = ws_manager
        self._running = False
        self._task = None
        self._monitored_assets = ["BTC-USD", "ETH-USD"]
        
    async def start(self):
        self._running = True
        self._task = asyncio.create_task(self._simulation_loop())
        logger.info("🐋 Whale Service started")
        
    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("🐋 Whale Service stopped")

    async def _simulation_loop(self):
        """Generates whale transactions based on price movement"""
        await asyncio.sleep(5) # warmup
        
        while self._running:
            try:
                # 1. Check market trends
                prices = await market_data_service.get_prices(self._monitored_assets)
                
                for ticker, data in prices.items():
                    # Random chance to spawn a whale event + volatility bonus
                    # In a real app, this would be triggered by on-chain analysis APIs
                    change = abs(data.get("change", 0))
                    
                    # Base chance 10%, +10% per 1% change
                    chance = 0.1 + (change * 0.1)
                    
                    if random.random() < chance:
                        await self._generate_whale_event(ticker, data)
                
                # Wait random time (5-15s)
                await asyncio.sleep(random.randint(5, 15))
                
            except Exception as e:
                logger.error(f"Whale service error: {e}")
                await asyncio.sleep(5)

    async def _generate_whale_event(self, ticker: str, price_data: dict):
        """create and broadcast a fake whale transaction"""
        is_bullish = price_data.get("change", 0) > 0
        
        # If bullish, higher chance of accumulation, but sometimes profit taking (distribution)
        if is_bullish:
            weights = [0.7, 0.3] # Buy, Sell
        else:
            weights = [0.3, 0.7] # Buy, Sell
            
        tx_type = random.choices([TxType.ACCUMULATION, TxType.DISTRIBUTION], weights=weights)[0]
        
        # Generate random wallet
        wallet = f"0x{random.randbytes(20).hex()}"
        
        # Amount: $500k to $50M
        amount = random.uniform(500_000, 50_000_000)
        
        async with self.session_maker() as session:
            whale = WhaleActivity(
                wallet_address=wallet,
                amount_usd=amount,
                tx_type=tx_type,
                timestamp=datetime.utcnow(),
                trust_score=random.uniform(60, 99),
                whale_age_days=random.randint(10, 3000),
                asset_code=ticker.split("-")[0] # BTC-USD -> BTC
            )
            session.add(whale)
            await session.commit()
            
            # Broadcast
            await self.ws_manager.broadcast({
                "type": "whale:alert",
                "data": {
                    "wallet_address": whale.wallet_address,
                    "amount_usd": whale.amount_usd,
                    "tx_type": whale.tx_type.value,
                    "timestamp": whale.timestamp.isoformat(),
                    "trust_score": whale.trust_score,
                    "asset_code": whale.asset_code
                }
            })
            
            verb = "bought" if tx_type == TxType.ACCUMULATION else "sold"
            logger.info(f"🐋 Whale Alert: {mask_wallet(wallet)} {verb} ${amount/1_000_000:.1f}M of {ticker}")

def mask_wallet(address):
    return f"{address[:6]}...{address[-4:]}"

# Singleton placeholder
whale_service = None

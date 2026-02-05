"""
Async Data Manager - Enhanced
Polls all data sources every 15 seconds and broadcasts unified JSON via WebSocket.

Features:
- High-concurrency polling of NSE, Crypto, Commodities
- Unified JSON broadcast format: {"asset": "RELIANCE", "price": 2984.50, "change_pc": 1.24, "type": "NSE"}
- Sentiment placeholder (0.0 to 1.0) for FinBERT integration
- Automatic fallback to mock data if sources fail
"""

import logging
import asyncio
from typing import Optional, Dict, List
from datetime import datetime

from app.services.nse_fetcher import nse_fetcher
from app.services.crypto_fetcher import crypto_fetcher
from app.services.commodity_fetcher import commodity_fetcher
from app.utils.decimal_guard import clean_data, detect_asset_type, get_mock_price

logger = logging.getLogger(__name__)

# Default watchlist for polling
DEFAULT_WATCHLIST = {
    'NSE': ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'],
    'CRYPTO': ['BTC', 'ETH', 'SOL'],
    'COMMODITY': ['GOLD', 'SILVER'],
}

# Polling interval in seconds
POLL_INTERVAL = 15


class AsyncDataManager:
    """
    Central data orchestrator for real-time market data.
    Polls all sources and broadcasts unified updates.
    
    Broadcast format:
    {
        "asset": "RELIANCE",
        "price": 2984.50,
        "change_pc": 1.24,
        "type": "NSE",
        "currency": "INR",
        "sentiment": 0.50,  # Placeholder for FinBERT
        "timestamp": "2026-02-05T02:30:00"
    }
    """
    
    def __init__(self, ws_manager=None):
        self.ws_manager = ws_manager
        self._watchlist = DEFAULT_WATCHLIST.copy()
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._latest_data: Dict[str, dict] = {}
    
    def add_to_watchlist(self, asset: str, asset_type: str = None):
        """Add an asset to the polling watchlist."""
        if asset_type is None:
            asset_type = detect_asset_type(asset)
        
        # Normalize asset type
        if asset_type.upper() in ['NSE', 'STOCK', 'EQUITY']:
            target = 'NSE'
        elif asset_type.upper() in ['CRYPTO', 'CRYPTOCURRENCY']:
            target = 'CRYPTO'
        elif asset_type.upper() in ['COMMODITY', 'METAL']:
            target = 'COMMODITY'
        else:
            target = 'NSE'  # Default
        
        if asset not in self._watchlist.get(target, []):
            self._watchlist.setdefault(target, []).append(asset)
            logger.info(f"Added {asset} to {target} watchlist")
    
    async def start(self):
        """Start the background polling loop."""
        if self._running:
            return
        
        self._running = True
        self._task = asyncio.create_task(self._poll_loop())
        logger.info(f"✅ AsyncDataManager started (polling every {POLL_INTERVAL}s)")
    
    async def stop(self):
        """Stop the background polling loop."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("⏹️ AsyncDataManager stopped")
    
    async def _poll_loop(self):
        """Main polling loop."""
        while self._running:
            try:
                # Fetch all data concurrently
                await self._fetch_all()
                
                # Broadcast via WebSocket
                if self.ws_manager:
                    for asset, data in self._latest_data.items():
                        try:
                            await self.ws_manager.broadcast(data)
                        except Exception as e:
                            logger.debug(f"Broadcast error for {asset}: {e}")
                
            except Exception as e:
                logger.error(f"Poll loop error: {e}")
            
            # Wait for next interval
            await asyncio.sleep(POLL_INTERVAL)
    
    async def _fetch_all(self):
        """Fetch data from all sources concurrently."""
        tasks = []
        
        # NSE stocks
        for symbol in self._watchlist.get('NSE', []):
            tasks.append(self._fetch_nse(symbol))
        
        # Crypto
        for symbol in self._watchlist.get('CRYPTO', []):
            tasks.append(self._fetch_crypto(symbol))
        
        # Commodities
        for symbol in self._watchlist.get('COMMODITY', []):
            tasks.append(self._fetch_commodity(symbol))
        
        # Run all fetchs concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        for result in results:
            if isinstance(result, Exception):
                logger.debug(f"Fetch exception: {result}")
            elif result:
                asset_key = result.get('asset', 'UNKNOWN')
                self._latest_data[asset_key] = result
    
    async def _fetch_nse(self, symbol: str) -> dict:
        """Fetch NSE stock data."""
        try:
            result = await nse_fetcher.get_quote(symbol)
            return self._format_broadcast(result, 'NSE')
        except Exception as e:
            logger.debug(f"NSE fetch error for {symbol}: {e}")
            return self._format_broadcast(get_mock_price(f"{symbol}.NS"), 'NSE')
    
    async def _fetch_crypto(self, symbol: str) -> dict:
        """Fetch crypto data."""
        try:
            result = await crypto_fetcher.get_quote(symbol)
            return self._format_broadcast(result, 'CRYPTO')
        except Exception as e:
            logger.debug(f"Crypto fetch error for {symbol}: {e}")
            return self._format_broadcast(get_mock_price(f"{symbol}-USD"), 'CRYPTO')
    
    async def _fetch_commodity(self, symbol: str) -> dict:
        """Fetch commodity data."""
        try:
            result = await commodity_fetcher.get_quote(symbol)
            return self._format_broadcast(result, 'COMMODITY')
        except Exception as e:
            logger.debug(f"Commodity fetch error for {symbol}: {e}")
            return self._format_broadcast(get_mock_price(symbol), 'COMMODITY')
    
    def _format_broadcast(self, data: dict, asset_type: str) -> dict:
        """
        Format data for unified WebSocket broadcast.
        
        Output format:
        {"asset": "RELIANCE", "price": 2984.50, "change_pc": 1.24, "type": "NSE", "sentiment": 0.50}
        """
        return {
            'asset': data.get('asset', 'UNKNOWN'),
            'price': clean_data(data.get('price', 0)),
            'change_pc': clean_data(data.get('change_pc', 0)),
            'type': asset_type,
            'currency': data.get('currency', 'USD'),
            'sentiment': data.get('sentiment', 0.50),  # Placeholder for FinBERT
            'is_mock': data.get('is_mock', False),
            'source': data.get('source', 'UNKNOWN'),
            'timestamp': datetime.now().isoformat()
        }
    
    async def get_quote(self, ticker: str) -> dict:
        """
        Get a single quote on-demand (for REST API).
        Detects asset type and routes to appropriate fetcher.
        """
        asset_type = detect_asset_type(ticker)
        
        if asset_type == 'NSE':
            return await nse_fetcher.get_quote(ticker)
        elif asset_type == 'CRYPTO':
            return await crypto_fetcher.get_quote(ticker)
        elif asset_type == 'COMMODITY':
            return await commodity_fetcher.get_quote(ticker)
        else:
            # Default to NSE for unknown
            return await nse_fetcher.get_quote(ticker)
    
    async def get_history(self, ticker: str, days: int = 180) -> List[dict]:
        """
        Get historical data for any asset.
        Routes to appropriate fetcher based on asset type.
        """
        asset_type = detect_asset_type(ticker)
        
        if asset_type == 'NSE':
            return await nse_fetcher.get_history(ticker, days)
        elif asset_type == 'CRYPTO':
            return await crypto_fetcher.get_history(ticker, days)
        elif asset_type == 'COMMODITY':
            return await commodity_fetcher.get_history(ticker, days)
        else:
            # Default to NSE
            return await nse_fetcher.get_history(ticker, days)
    
    def get_latest(self, asset: str) -> Optional[dict]:
        """Get latest cached data for an asset."""
        return self._latest_data.get(asset)
    
    def get_all_latest(self) -> Dict[str, dict]:
        """Get all latest cached data."""
        return self._latest_data.copy()


# Singleton instance (ws_manager injected on app startup)
data_manager: Optional[AsyncDataManager] = None


def get_data_manager() -> AsyncDataManager:
    """Get or create the data manager singleton."""
    global data_manager
    if data_manager is None:
        data_manager = AsyncDataManager()
    return data_manager


def init_data_manager(ws_manager=None) -> AsyncDataManager:
    """Initialize data manager with WebSocket manager."""
    global data_manager
    data_manager = AsyncDataManager(ws_manager)
    return data_manager

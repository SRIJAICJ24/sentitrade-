"""
Market Data Service using yfinance
Provides real-time price data and trend detection for Crypto, Stocks, and Gold
"""

import logging
from typing import Optional, Literal
from datetime import datetime, timedelta
from functools import lru_cache
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Thread pool for async yfinance calls (yfinance is sync)
_executor = ThreadPoolExecutor(max_workers=3)


def _fetch_ticker_info(symbol: str) -> dict:
    """Sync function to fetch ticker info (runs in thread pool)"""
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return {
            "symbol": symbol,
            "price": info.get("regularMarketPrice") or info.get("previousClose", 0),
            "change": info.get("regularMarketChangePercent", 0),
            "volume": info.get("regularMarketVolume", 0),
            "market_cap": info.get("marketCap", 0),
            "name": info.get("shortName", symbol),
            "currency": info.get("currency", "USD"),
            "success": True
        }
    except Exception as e:
        logger.error(f"Failed to fetch {symbol}: {e}")
        return {
            "symbol": symbol,
            "price": 0,
            "change": 0,
            "volume": 0,
            "success": False,
            "error": str(e)
        }


def _fetch_history(symbol: str, period: str = "1d", interval: str = "1h") -> list:
    """Sync function to fetch price history (runs in thread pool)"""
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            return []
        
        data = []
        for idx, row in hist.iterrows():
            data.append({
                "time": idx.isoformat(),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": int(row["Volume"]),
            })
        return data
    except Exception as e:
        logger.error(f"Failed to fetch history for {symbol}: {e}")
        return []

def _search_tickers(query: str) -> list:
    """Sync function to search tickers (runs in thread pool)"""
    try:
        import yfinance as yf
        # yfinance does not have a direct search API exposed cleanly
        # We will assume exact ticker match or use a small hack
        
        ticker = yf.Ticker(query)
        info = ticker.info
        
        # Heuristic to check if valid
        if "regularMarketPrice" in info or "previousClose" in info:
             return [{
                "symbol": query.upper(),
                "name": info.get("shortName", query.upper()),
                "type": info.get("quoteType", "EQUITY"),
                "exchange": info.get("exchange", "UNKNOWN"),
                "price": info.get("regularMarketPrice") or info.get("previousClose", 0.0),
                "currency": info.get("currency", "USD")
            }]
            
        return []
    except Exception as e:
        logger.error(f"Failed to search {query}: {e}")
        return []

class MarketDataService:
    """
    Market data service for multi-asset support.
    Supports: BTC-USD (Crypto), AAPL (Stock), GC=F (Gold Futures)
    """
    
    # Symbol mapping for display names
    SYMBOL_NAMES = {
        "BTC-USD": "Bitcoin",
        "AAPL": "Apple Inc.",
        "GC=F": "Gold Futures",
        "ETH-USD": "Ethereum",
        "SPY": "S&P 500 ETF",
    }
    
    def __init__(self):
        self._cache = {}
        self._cache_ttl = 60  # Cache for 60 seconds
    
    async def get_price(self, symbol: str) -> dict:
        """
        Get current price for a symbol.
        
        Args:
            symbol: yfinance symbol (e.g., "BTC-USD", "AAPL", "GC=F")
            
        Returns:
            Price data dict
        """
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(_executor, _fetch_ticker_info, symbol)
        return result
    
    async def get_prices(self, symbols: list[str]) -> dict:
        """Get prices for multiple symbols concurrently"""
        tasks = [self.get_price(symbol) for symbol in symbols]
        results = await asyncio.gather(*tasks)
        return {r["symbol"]: r for r in results}
    
    async def get_history(
        self,
        symbol: str,
        period: str = "1d",
        interval: str = "1h"
    ) -> list:
        """
        Get price history for charting.
        
        Args:
            symbol: yfinance symbol
            period: "1d", "5d", "1mo", "3mo"
            interval: "1m", "5m", "15m", "1h", "1d"
        """
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            _executor,
            _fetch_history,
            symbol,
            period,
            interval
        )
        return result
    
    async def get_1h_trend(self, symbol: str) -> Literal["UP", "DOWN", "FLAT"]:
        """
        Determine 1-hour price trend.
        
        Returns:
            "UP" if price increased > 0.5%
            "DOWN" if price decreased > 0.5%
            "FLAT" otherwise
        """
        history = await self.get_history(symbol, period="1d", interval="1h")
        
        if len(history) < 2:
            return "FLAT"
        
        # Compare last 2 candles
        prev_close = history[-2]["close"]
        curr_close = history[-1]["close"]
        
        if prev_close == 0:
            return "FLAT"
        
        change_percent = ((curr_close - prev_close) / prev_close) * 100
        
        if change_percent > 0.5:
            return "UP"
        elif change_percent < -0.5:
            return "DOWN"
        else:
            return "FLAT"
    
    async def get_volatility(self, symbol: str) -> float:
        """
        Calculate recent volatility (standard deviation of returns).
        
        Returns:
            Volatility as percentage (e.g., 2.5 for 2.5%)
        """
        history = await self.get_history(symbol, period="5d", interval="1h")
        
        if len(history) < 10:
            return 1.0  # Default volatility
        
        # Calculate hourly returns
        returns = []
        for i in range(1, len(history)):
            prev = history[i-1]["close"]
            curr = history[i]["close"]
            if prev > 0:
                ret = ((curr - prev) / prev) * 100
                returns.append(ret)
        
        if not returns:
            return 1.0
        
        # Standard deviation of returns
        mean = sum(returns) / len(returns)
        variance = sum((r - mean) ** 2 for r in returns) / len(returns)
        volatility = variance ** 0.5
        
        return round(volatility, 2)
    
    def search_assets(self, query: str) -> list:
        """
        Search for assets using NIFTY 500 database (synchronous)
        """
        query_upper = query.upper()
        results = []
        
        # 1. Load Static Database (Lazy Load) - Simplified
        if not hasattr(self, '_nifty_db'):
            import json
            import os
            try:
                # Resolve path relative to this file
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                json_path = os.path.join(base_dir, "data", "nifty_500.json")
                
                with open(json_path, "r", encoding='utf-8') as f:
                    self._nifty_db = json.load(f)
                print(f"Loaded {len(self._nifty_db)} stocks from database")
            except Exception as e:
                print(f"ERROR loading JSON: {e}")
                self._nifty_db = []

        # 2. Filter Static DB
        if self._nifty_db:
            for item in self._nifty_db:
                try:
                    if query_upper in item['symbol'] or query_upper in item['name'].upper():
                        results.append({
                            "symbol": item['symbol'],
                            "name": item['name'],
                            "type": "STOCK",
                            "exchange": "NSE",
                            "price": "Live Check",
                            "currency": "INR"
                        })
                        if len(results) >= 10: 
                            break
                except Exception as e:
                    print(f"Error processing item: {e}")
                    continue

        # 3. If no static results, allow custom ticker
        if not results:
            if ".NS" in query_upper or ".BO" in query_upper:
                results.append({
                    "symbol": query_upper,
                    "name": query_upper,
                    "type": "CUSTOM",
                    "exchange": "NSE/BSE",
                    "price": "Check",
                    "currency": "INR"
                })

        return results


# Singleton instance
market_data_service = MarketDataService()

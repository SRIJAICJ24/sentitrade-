"""
NSE Fetcher Service - Enhanced
Fetches real-time and historical data for NSE India stocks.

Primary Source: Indian-Stock-Market-API (0xramm)
Secondary Source: Direct NSE API
Fallback: yfinance with .NS suffix
Historical: nsepy for 180-day OHLC

STRICT: All prices formatted in en-IN locale (₹1,12,450.00)
"""

import logging
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
import aiohttp

from app.utils.decimal_guard import clean_data, format_inr, detect_asset_type, get_mock_price

logger = logging.getLogger(__name__)

# Thread pool for sync operations
_executor = ThreadPoolExecutor(max_workers=4)

# Browser-like headers for NSE direct API
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.nseindia.com/',
    'Connection': 'keep-alive',
}

# 0xramm API Base URL (Indian-Stock-Market-API)
XRAMM_API_BASE = "https://indian-stock-market-api.onrender.com"

# NSE Direct API Base URL  
NSE_BASE_URL = "https://www.nseindia.com/api"


class NSEFetcher:
    """
    NSE India Data Fetcher with multi-source fallback.
    
    Priority:
    1. 0xramm Indian-Stock-Market-API (primary)
    2. NSE Direct API (secondary)
    3. yfinance (fallback)
    4. Mock data (emergency)
    """
    
    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None
        self._cookies_set = False
        self._last_prices: Dict[str, dict] = {}
        
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=10)
            self._session = aiohttp.ClientSession(
                timeout=timeout,
                headers=HEADERS
            )
        return self._session
    
    async def get_quote(self, symbol: str) -> dict:
        """
        Get real-time quote for an NSE stock.
        
        Args:
            symbol: Stock symbol (e.g., 'RELIANCE', 'TCS', 'HDFCBANK')
            
        Returns:
            Dict with price data including sentiment placeholder
        """
        # Normalize symbol (remove .NS suffix if present)
        clean_symbol = symbol.upper().replace('.NS', '').replace('.BO', '').strip()
        
        # Try sources in priority order
        result = None
        
        # 1. Try 0xramm API (primary)
        result = await self._fetch_xramm_quote(clean_symbol)
        if result and result.get('price', 0) > 0:
            logger.info(f"✅ [0xramm] Got price for {clean_symbol}: ₹{result['price']}")
            self._last_prices[clean_symbol] = result
            return result
        
        # 2. Try NSE Direct API (secondary)
        result = await self._fetch_nse_direct(clean_symbol)
        if result and result.get('price', 0) > 0:
            logger.info(f"✅ [NSE Direct] Got price for {clean_symbol}: ₹{result['price']}")
            self._last_prices[clean_symbol] = result
            return result
        
        # 3. Try yfinance (fallback)
        result = await self._fetch_yfinance_quote(clean_symbol)
        if result and result.get('price', 0) > 0:
            logger.info(f"✅ [yfinance] Got price for {clean_symbol}: ₹{result['price']}")
            self._last_prices[clean_symbol] = result
            return result
        
        # 4. Return cached or mock data (emergency)
        logger.warning(f"⚠️ All sources failed for {clean_symbol}, using fallback")
        return self._get_fallback(clean_symbol)
    
    async def _fetch_xramm_quote(self, symbol: str) -> Optional[dict]:
        """
        Fetch from 0xramm Indian-Stock-Market-API.
        
        API: https://indian-stock-market-api.onrender.com/api/v1/equity/{symbol}
        """
        try:
            session = await self._get_session()
            url = f"{XRAMM_API_BASE}/api/v1/equity/{symbol}"
            
            async with session.get(url) as response:
                if response.status != 200:
                    return None
                    
                data = await response.json()
                
                # Extract price from API response
                price = data.get('lastPrice') or data.get('price') or data.get('lastTradedPrice', 0)
                change_pc = data.get('pChange') or data.get('changePercent', 0)
                
                return {
                    'asset': f"{symbol}.NS",
                    'price': clean_data(price),
                    'change_pc': clean_data(change_pc),
                    'type': 'NSE',
                    'currency': 'INR',
                    'source': '0xramm',
                    'is_mock': False,
                    'sentiment': 0.50,  # Placeholder for FinBERT
                    'name': data.get('companyName', symbol),
                    'volume': data.get('totalTradedVolume', 0),
                    'timestamp': datetime.now().isoformat()
                }
        except Exception as e:
            logger.debug(f"[0xramm] Failed for {symbol}: {e}")
            return None
    
    async def _fetch_nse_direct(self, symbol: str) -> Optional[dict]:
        """
        Fetch directly from NSE India API.
        
        Requires cookie handling for access.
        """
        try:
            session = await self._get_session()
            
            # First, get cookies from NSE homepage
            if not self._cookies_set:
                try:
                    async with session.get("https://www.nseindia.com") as resp:
                        self._cookies_set = True
                except:
                    pass
            
            # Fetch quote
            url = f"{NSE_BASE_URL}/quote-equity?symbol={symbol}"
            
            async with session.get(url) as response:
                if response.status != 200:
                    return None
                    
                data = await response.json()
                price_info = data.get('priceInfo', {})
                
                price = price_info.get('lastPrice', 0)
                change_pc = price_info.get('pChange', 0)
                
                return {
                    'asset': f"{symbol}.NS",
                    'price': clean_data(price),
                    'change_pc': clean_data(change_pc),
                    'type': 'NSE',
                    'currency': 'INR',
                    'source': 'NSE_DIRECT',
                    'is_mock': False,
                    'sentiment': 0.50,
                    'name': data.get('info', {}).get('companyName', symbol),
                    'volume': price_info.get('totalTradedVolume', 0),
                    'timestamp': datetime.now().isoformat()
                }
        except Exception as e:
            logger.debug(f"[NSE Direct] Failed for {symbol}: {e}")
            return None
    
    async def _fetch_yfinance_quote(self, symbol: str) -> Optional[dict]:
        """Fetch from yfinance as fallback."""
        try:
            loop = asyncio.get_event_loop()
            
            def _sync_fetch():
                import yfinance as yf
                ticker = yf.Ticker(f"{symbol}.NS")
                info = ticker.info
                
                price = info.get('regularMarketPrice') or info.get('previousClose', 0)
                change_pc = info.get('regularMarketChangePercent', 0)
                
                return {
                    'asset': f"{symbol}.NS",
                    'price': clean_data(price),
                    'change_pc': clean_data(change_pc),
                    'type': 'NSE',
                    'currency': 'INR',
                    'source': 'yfinance',
                    'is_mock': False,
                    'sentiment': 0.50,
                    'name': info.get('shortName', symbol),
                    'volume': info.get('regularMarketVolume', 0),
                    'timestamp': datetime.now().isoformat()
                }
            
            result = await loop.run_in_executor(_executor, _sync_fetch)
            return result
        except Exception as e:
            logger.debug(f"[yfinance] Failed for {symbol}: {e}")
            return None
    
    def _get_fallback(self, symbol: str) -> dict:
        """Return cached or mock data."""
        # Try cached data first
        if symbol in self._last_prices:
            cached = self._last_prices[symbol].copy()
            cached['source'] = 'CACHED'
            return cached
        
        # Return mock data
        return get_mock_price(f"{symbol}.NS")
    
    async def get_history(self, symbol: str, days: int = 180) -> List[dict]:
        """
        Fetch historical OHLC data for backtesting.
        
        Uses nsepy for reliable NSE historical data.
        Fallback to yfinance if nsepy fails.
        
        Args:
            symbol: Stock symbol
            days: Number of days of history (default 180)
            
        Returns:
            List of OHLC candles for lightweight-charts format:
            { time: 'YYYY-MM-DD', open, high, low, close, volume }
        """
        clean_symbol = symbol.upper().replace('.NS', '').replace('.BO', '').strip()
        
        loop = asyncio.get_event_loop()
        
        def _sync_fetch_history():
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Try nsepy first (reliable for NSE data)
            try:
                from nsepy import get_history as nsepy_get_history
                
                df = nsepy_get_history(
                    symbol=clean_symbol,
                    start=start_date.date(),
                    end=end_date.date()
                )
                
                if df is not None and not df.empty:
                    candles = []
                    for idx, row in df.iterrows():
                        candles.append({
                            'time': idx.strftime('%Y-%m-%d'),
                            'open': clean_data(row['Open']),
                            'high': clean_data(row['High']),
                            'low': clean_data(row['Low']),
                            'close': clean_data(row['Close']),
                            'volume': int(row.get('Volume', row.get('Traded Volume', 0))),
                        })
                    logger.info(f"✅ [nsepy] Got {len(candles)} candles for {clean_symbol}")
                    return candles
            except Exception as e:
                logger.warning(f"[nsepy] Failed for {clean_symbol}: {e}")
            
            # Fallback to yfinance
            try:
                import yfinance as yf
                
                ticker = yf.Ticker(f"{clean_symbol}.NS")
                df = ticker.history(period=f"{days}d")
                
                if df is not None and not df.empty:
                    candles = []
                    for idx, row in df.iterrows():
                        candles.append({
                            'time': idx.strftime('%Y-%m-%d'),
                            'open': clean_data(row['Open']),
                            'high': clean_data(row['High']),
                            'low': clean_data(row['Low']),
                            'close': clean_data(row['Close']),
                            'volume': int(row['Volume']),
                        })
                    logger.info(f"✅ [yfinance] Got {len(candles)} candles for {clean_symbol}")
                    return candles
            except Exception as e:
                logger.warning(f"[yfinance history] Failed for {clean_symbol}: {e}")
            
            return []
        
        result = await loop.run_in_executor(_executor, _sync_fetch_history)
        return result
    
    async def get_indices(self) -> dict:
        """
        Fetch NIFTY 50 and SENSEX index values.
        """
        try:
            session = await self._get_session()
            
            # Try 0xramm API for indices
            nifty_url = f"{XRAMM_API_BASE}/api/v1/index/NIFTY%2050"
            sensex_url = f"{XRAMM_API_BASE}/api/v1/index/SENSEX"
            
            result = {'NIFTY50': None, 'SENSEX': None}
            
            try:
                async with session.get(nifty_url) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        result['NIFTY50'] = {
                            'value': clean_data(data.get('last', 0)),
                            'change_pc': clean_data(data.get('pChange', 0))
                        }
            except:
                pass
            
            try:
                async with session.get(sensex_url) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        result['SENSEX'] = {
                            'value': clean_data(data.get('last', 0)),
                            'change_pc': clean_data(data.get('pChange', 0))
                        }
            except:
                pass
            
            return result
        except Exception as e:
            logger.error(f"Failed to fetch indices: {e}")
            return {'NIFTY50': None, 'SENSEX': None}
    
    async def close(self):
        """Close the aiohttp session."""
        if self._session and not self._session.closed:
            await self._session.close()


# Singleton instance
nse_fetcher = NSEFetcher()

"""
Crypto Fetcher Service - Enhanced
Fetches real-time and historical data for cryptocurrencies.

Primary Source: CCXT (Binance) - public endpoints, no API key needed
Fallback: CoinGecko Public API
Historical: CCXT fetchOHLCV for 1-hour interval candles (30 days)

STRICT: All prices rounded to 2 decimal places via Decimal Guard
"""

import logging
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
import aiohttp

from app.utils.decimal_guard import clean_data, detect_asset_type, get_mock_price

logger = logging.getLogger(__name__)

# Thread pool for sync CCXT operations
_executor = ThreadPoolExecutor(max_workers=4)

# CoinGecko API (no API key required)
COINGECKO_API = "https://api.coingecko.com/api/v3"

# Coin ID mapping for CoinGecko
COINGECKO_IDS = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'XRP': 'ripple',
    'SOL': 'solana',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'DOGE': 'dogecoin',
    'MATIC': 'matic-network',
    'LINK': 'chainlink',
    'AVAX': 'avalanche-2',
    'BNB': 'binancecoin',
    'SHIB': 'shiba-inu',
    'LTC': 'litecoin',
    'UNI': 'uniswap',
    'ATOM': 'cosmos',
}


class CryptoFetcher:
    """
    Cryptocurrency Data Fetcher using CCXT and CoinGecko.
    
    Priority:
    1. CCXT (Binance) for real-time prices
    2. CoinGecko for quotes and history
    3. Mock data for emergency fallback
    """
    
    def __init__(self):
        self._exchange = None
        self._session: Optional[aiohttp.ClientSession] = None
        self._last_prices: Dict[str, dict] = {}
        
    def _get_exchange(self):
        """Initialize CCXT Binance exchange (public endpoints only)."""
        if self._exchange is None:
            try:
                import ccxt
                self._exchange = ccxt.binance({
                    'enableRateLimit': True,
                    'options': {
                        'defaultType': 'spot',
                    }
                })
                logger.info("✅ CCXT Binance exchange initialized")
            except Exception as e:
                logger.warning(f"Failed to init CCXT: {e}")
        return self._exchange
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=15)
            self._session = aiohttp.ClientSession(timeout=timeout)
        return self._session
    
    def _normalize_symbol(self, symbol: str) -> str:
        """Normalize symbol to base (e.g., BTC-USD -> BTC)."""
        symbol = symbol.upper()
        for suffix in ['-USD', '/USD', 'USDT', '-USDT', '/USDT']:
            symbol = symbol.replace(suffix, '')
        return symbol.strip()
    
    async def get_quote(self, symbol: str) -> dict:
        """
        Get real-time quote for a cryptocurrency.
        
        Args:
            symbol: Crypto symbol (e.g., 'BTC', 'ETH', 'BTC-USD')
            
        Returns:
            Dict with price data including sentiment placeholder
        """
        base = self._normalize_symbol(symbol)
        
        # 1. Try CCXT Binance (primary)
        result = await self._fetch_ccxt_quote(base)
        if result and result.get('price', 0) > 0:
            logger.info(f"✅ [CCXT] Got price for {base}: ${result['price']}")
            self._last_prices[base] = result
            return result
        
        # 2. Try CoinGecko (fallback)
        result = await self._fetch_coingecko_quote(base)
        if result and result.get('price', 0) > 0:
            logger.info(f"✅ [CoinGecko] Got price for {base}: ${result['price']}")
            self._last_prices[base] = result
            return result
        
        # 3. Return cached or mock data
        logger.warning(f"⚠️ All sources failed for {base}, using fallback")
        return self._get_fallback(base)
    
    async def _fetch_ccxt_quote(self, symbol: str) -> Optional[dict]:
        """Fetch from CCXT Binance."""
        try:
            loop = asyncio.get_event_loop()
            
            def _sync_fetch():
                exchange = self._get_exchange()
                if not exchange:
                    return None
                
                # Fetch ticker for symbol/USDT pair
                ccxt_symbol = f"{symbol}/USDT"
                ticker = exchange.fetch_ticker(ccxt_symbol)
                
                price = ticker.get('last', 0)
                change_pc = ticker.get('percentage', 0)
                
                return {
                    'asset': f"{symbol}-USD",
                    'price': clean_data(price),
                    'change_pc': clean_data(change_pc),
                    'type': 'CRYPTO',
                    'currency': 'USD',
                    'source': 'CCXT',
                    'is_mock': False,
                    'sentiment': 0.50,  # Placeholder for FinBERT
                    'volume': clean_data(ticker.get('baseVolume', 0)),
                    'high_24h': clean_data(ticker.get('high', 0)),
                    'low_24h': clean_data(ticker.get('low', 0)),
                    'timestamp': datetime.now().isoformat()
                }
            
            result = await loop.run_in_executor(_executor, _sync_fetch)
            return result
        except Exception as e:
            logger.debug(f"[CCXT] Failed for {symbol}: {e}")
            return None
    
    async def _fetch_coingecko_quote(self, symbol: str) -> Optional[dict]:
        """Fetch from CoinGecko API."""
        try:
            coin_id = COINGECKO_IDS.get(symbol.upper())
            if not coin_id:
                return None
            
            session = await self._get_session()
            url = f"{COINGECKO_API}/simple/price"
            params = {
                'ids': coin_id,
                'vs_currencies': 'usd',
                'include_24hr_change': 'true',
                'include_24hr_vol': 'true',
            }
            
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    return None
                    
                data = await response.json()
                coin_data = data.get(coin_id, {})
                
                price = coin_data.get('usd', 0)
                change_pc = coin_data.get('usd_24h_change', 0)
                
                return {
                    'asset': f"{symbol}-USD",
                    'price': clean_data(price),
                    'change_pc': clean_data(change_pc),
                    'type': 'CRYPTO',
                    'currency': 'USD',
                    'source': 'CoinGecko',
                    'is_mock': False,
                    'sentiment': 0.50,
                    'volume': clean_data(coin_data.get('usd_24h_vol', 0)),
                    'timestamp': datetime.now().isoformat()
                }
        except Exception as e:
            logger.debug(f"[CoinGecko] Failed for {symbol}: {e}")
            return None
    
    def _get_fallback(self, symbol: str) -> dict:
        """Return cached or mock data."""
        if symbol in self._last_prices:
            cached = self._last_prices[symbol].copy()
            cached['source'] = 'CACHED'
            return cached
        
        return get_mock_price(f"{symbol}-USD")
    
    async def get_history(self, symbol: str, days: int = 30, interval: str = '1h') -> List[dict]:
        """
        Fetch historical OHLC data using CCXT fetchOHLCV.
        
        Args:
            symbol: Crypto symbol
            days: Number of days (default 30)
            interval: Candle interval ('1h' for 1-hour, '1d' for daily)
            
        Returns:
            List of OHLC candles for lightweight-charts format
        """
        base = self._normalize_symbol(symbol)
        
        loop = asyncio.get_event_loop()
        
        def _sync_fetch_history():
            # Try CCXT fetchOHLCV first (most reliable)
            try:
                exchange = self._get_exchange()
                if exchange:
                    ccxt_symbol = f"{base}/USDT"
                    
                    # Map interval to CCXT timeframe
                    timeframe = '1h' if interval == '1h' else '1d'
                    
                    # Calculate limit (number of candles)
                    if timeframe == '1h':
                        limit = min(days * 24, 720)  # Max 720 candles (30 days)
                    else:
                        limit = min(days, 365)
                    
                    # Fetch OHLCV data
                    ohlcv = exchange.fetch_ohlcv(ccxt_symbol, timeframe, limit=limit)
                    
                    if ohlcv:
                        candles = []
                        for candle in ohlcv:
                            timestamp, open_p, high, low, close, volume = candle
                            candles.append({
                                'time': datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d'),
                                'open': clean_data(open_p),
                                'high': clean_data(high),
                                'low': clean_data(low),
                                'close': clean_data(close),
                                'volume': clean_data(volume),
                            })
                        logger.info(f"✅ [CCXT] Got {len(candles)} candles for {base}")
                        return candles
            except Exception as e:
                logger.warning(f"[CCXT OHLCV] Failed for {base}: {e}")
            
            # Fallback to CoinGecko market chart
            try:
                import requests
                
                coin_id = COINGECKO_IDS.get(base.upper())
                if coin_id:
                    url = f"{COINGECKO_API}/coins/{coin_id}/market_chart"
                    params = {'vs_currency': 'usd', 'days': days}
                    
                    response = requests.get(url, params=params, timeout=15)
                    if response.status_code == 200:
                        data = response.json()
                        prices = data.get('prices', [])
                        
                        candles = []
                        for i, (timestamp, price) in enumerate(prices):
                            if i % 4 == 0:  # Sample every 4th point for cleaner data
                                candles.append({
                                    'time': datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d'),
                                    'open': clean_data(price),
                                    'high': clean_data(price * 1.005),
                                    'low': clean_data(price * 0.995),
                                    'close': clean_data(price),
                                    'volume': 0,
                                })
                        logger.info(f"✅ [CoinGecko] Got {len(candles)} candles for {base}")
                        return candles
            except Exception as e:
                logger.warning(f"[CoinGecko history] Failed for {base}: {e}")
            
            return []
        
        result = await loop.run_in_executor(_executor, _sync_fetch_history)
        return result
    
    async def close(self):
        """Close the aiohttp session."""
        if self._session and not self._session.closed:
            await self._session.close()


# Singleton instance
crypto_fetcher = CryptoFetcher()

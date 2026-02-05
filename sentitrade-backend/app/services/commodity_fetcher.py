"""
Commodity Fetcher Service - Enhanced
Fetches real-time and historical data for commodities.

Primary Source: yfinance (GC=F for Gold, SI=F for Silver)
Localization: MCX conversion for "Chennai Gold Census" and "Mumbai Spot" metrics

STRICT: All prices rounded to 2 decimal places via Decimal Guard
"""

import logging
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor

from app.utils.decimal_guard import clean_data, format_inr, get_mock_price

logger = logging.getLogger(__name__)

# Thread pool for sync yfinance operations
_executor = ThreadPoolExecutor(max_workers=4)

# yfinance tickers for commodities
COMMODITY_TICKERS = {
    'GOLD': 'GC=F',      # Gold Futures (COMEX)
    'SILVER': 'SI=F',    # Silver Futures (COMEX)
    'CRUDE': 'CL=F',     # Crude Oil Futures (NYMEX)
    'NATGAS': 'NG=F',    # Natural Gas Futures
    'COPPER': 'HG=F',    # Copper Futures
    'PLATINUM': 'PL=F',  # Platinum Futures
}

# MCX Localization multipliers (for Indian spot prices)
# Gold: USD per oz -> INR per 10 grams
# Silver: USD per oz -> INR per kg
MCX_MULTIPLIERS = {
    'GOLD': {
        'factor': 0.321507,  # oz to 10g conversion: 31.1035 / 10 / (USD/INR)
        'usd_to_inr': 83.50,  # Approximate exchange rate
        'unit': 'per 10g',
        'display_name': 'Chennai Gold Census'
    },
    'SILVER': {
        'factor': 35.274,  # oz to kg: 32.1507 * (USD/INR)
        'usd_to_inr': 83.50,
        'unit': 'per kg',
        'display_name': 'Mumbai Spot Silver'
    },
}


class CommodityFetcher:
    """
    Commodity Data Fetcher using yfinance with MCX localization.
    
    Features:
    - Real-time global prices from yfinance
    - MCX-equivalent Indian spot prices (Chennai Gold, Mumbai Silver)
    - Historical data for backtesting
    """
    
    def __init__(self):
        self._last_prices: Dict[str, dict] = {}
    
    def _normalize_symbol(self, symbol: str) -> str:
        """Normalize symbol (GOLD, SILVER, GC=F, etc.)"""
        symbol = symbol.upper().strip()
        # If yfinance ticker passed directly, extract commodity name
        for name, ticker in COMMODITY_TICKERS.items():
            if symbol == ticker:
                return name
        return symbol
    
    async def get_quote(self, symbol: str, localize_inr: bool = True) -> dict:
        """
        Get real-time quote for a commodity.
        
        Args:
            symbol: Commodity symbol (e.g., 'GOLD', 'SILVER', 'GC=F')
            localize_inr: If True, also return MCX-equivalent INR price
            
        Returns:
            Dict with price data including sentiment placeholder
        """
        base = self._normalize_symbol(symbol)
        yf_ticker = COMMODITY_TICKERS.get(base, symbol)
        
        loop = asyncio.get_event_loop()
        
        def _sync_fetch():
            try:
                import yfinance as yf
                
                ticker = yf.Ticker(yf_ticker)
                info = ticker.info
                
                # Get USD price
                price_usd = info.get('regularMarketPrice') or info.get('previousClose', 0)
                change_pc = info.get('regularMarketChangePercent', 0)
                
                result = {
                    'asset': base,
                    'price': clean_data(price_usd),
                    'change_pc': clean_data(change_pc),
                    'type': 'COMMODITY',
                    'currency': 'USD',
                    'source': 'yfinance',
                    'is_mock': False,
                    'sentiment': 0.50,  # Placeholder for FinBERT
                    'name': info.get('shortName', base),
                    'volume': info.get('regularMarketVolume', 0),
                    'timestamp': datetime.now().isoformat()
                }
                
                # Add MCX localized price if available
                if localize_inr and base in MCX_MULTIPLIERS:
                    mcx = MCX_MULTIPLIERS[base]
                    
                    # Convert USD/oz to INR/unit
                    inr_price = price_usd * mcx['usd_to_inr'] * mcx['factor']
                    
                    result['inr_price'] = clean_data(inr_price)
                    result['inr_formatted'] = format_inr(inr_price)
                    result['mcx_unit'] = mcx['unit']
                    result['mcx_display'] = mcx['display_name']
                
                return result
            except Exception as e:
                logger.error(f"[yfinance] Failed for {yf_ticker}: {e}")
                return None
        
        result = await loop.run_in_executor(_executor, _sync_fetch)
        
        if result and result.get('price', 0) > 0:
            logger.info(f"✅ [yfinance] Got price for {base}: ${result['price']}")
            self._last_prices[base] = result
            return result
        
        # Fallback to cached or mock data
        logger.warning(f"⚠️ Source failed for {base}, using fallback")
        return self._get_fallback(base)
    
    def _get_fallback(self, symbol: str) -> dict:
        """Return cached or mock data."""
        if symbol in self._last_prices:
            cached = self._last_prices[symbol].copy()
            cached['source'] = 'CACHED'
            return cached
        
        return get_mock_price(symbol)
    
    async def get_history(self, symbol: str, days: int = 180) -> List[dict]:
        """
        Fetch historical OHLC data for commodities.
        
        Args:
            symbol: Commodity symbol
            days: Number of days of history (default 180)
            
        Returns:
            List of OHLC candles for lightweight-charts format
        """
        base = self._normalize_symbol(symbol)
        yf_ticker = COMMODITY_TICKERS.get(base, symbol)
        
        loop = asyncio.get_event_loop()
        
        def _sync_fetch_history():
            try:
                import yfinance as yf
                
                ticker = yf.Ticker(yf_ticker)
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
                    logger.info(f"✅ [yfinance] Got {len(candles)} candles for {base}")
                    return candles
            except Exception as e:
                logger.warning(f"[yfinance history] Failed for {base}: {e}")
            
            return []
        
        result = await loop.run_in_executor(_executor, _sync_fetch_history)
        return result
    
    async def get_chennai_gold(self) -> dict:
        """
        Get Chennai Gold Census price (10g rate).
        
        Uses Gold Futures (GC=F) and converts to MCX-equivalent INR.
        """
        return await self.get_quote('GOLD', localize_inr=True)
    
    async def get_mumbai_silver(self) -> dict:
        """
        Get Mumbai Spot Silver price (per kg rate).
        
        Uses Silver Futures (SI=F) and converts to MCX-equivalent INR.
        """
        return await self.get_quote('SILVER', localize_inr=True)
    
    async def get_all_commodities(self) -> Dict[str, dict]:
        """
        Get quotes for all major commodities.
        """
        commodities = ['GOLD', 'SILVER', 'CRUDE']
        results = {}
        
        for commodity in commodities:
            try:
                quote = await self.get_quote(commodity)
                results[commodity] = quote
            except Exception as e:
                logger.error(f"Failed to get {commodity}: {e}")
                results[commodity] = self._get_fallback(commodity)
        
        return results


# Singleton instance
commodity_fetcher = CommodityFetcher()

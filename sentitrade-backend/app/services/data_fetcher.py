import yfinance as yf
import pandas as pd
import pytz
from datetime import datetime, timedelta
from typing import Optional, Dict
from app.services.market_auditor import market_auditor

IST = pytz.timezone('Asia/Kolkata')


class IndianDataFetcher:
    """
    Fetches and normalizes data for NSE/BSE stocks.
    Handles Symbology (.NS), Timezone conversion, and Gap Filling.
    """
    def __init__(self):
        self._cache = {}
        self._cache_ttl = 60  # seconds

    async def fetch_live_quote(self, symbol: str) -> Optional[Dict]:
        """
        Fetch latest 5m candle for a stock.
        """
        # 0. Check Cache
        now = datetime.now()
        if symbol in self._cache:
            data, timestamp = self._cache[symbol]
            if (now - timestamp).total_seconds() < self._cache_ttl:
                return data

        # 1. Symbology Fix
        if not symbol.endswith(('.NS', '.BO')) and '^' not in symbol:
            symbol = f"{symbol}.NS" # Default to NSE
            
        try:
            # 2. Fetch Data (1d period, 5m interval, auto_adjust=False for raw price)
            # Run blocking yfinance call in a thread to avoid blocking event loop
            import asyncio
            from concurrent.futures import ThreadPoolExecutor
            
            loop = asyncio.get_event_loop()
            
            def load_yf_data():
                ticker = yf.Ticker(symbol)
                return ticker.history(period="2d", interval="5m", auto_adjust=False)

            with ThreadPoolExecutor() as pool:
                df = await loop.run_in_executor(pool, load_yf_data)
            
            if df.empty:
                return None
                
            # 3. Timezone Normalization
            if df.index.tzinfo is None:
                 # If naive, assume UTC layout from yfinance usually, but history() often returns local-aware
                 # Force conversion to IST
                 df.index = df.index.tz_localize(pytz.utc).tz_convert(IST)
            else:
                 df.index = df.index.tz_convert(IST)

            # Get latest candle
            latest = df.iloc[-1]
            prev_close = df.iloc[-2]['Close'] if len(df) > 1 else latest['Open'] # Fallback
            
            candle = {
                "timestamp": latest.name.to_pydatetime(),
                "asset_code": symbol,
                "open": float(latest['Open']),
                "high": float(latest['High']),
                "low": float(latest['Low']),
                "close": float(latest['Close']),
                "volume": int(latest['Volume']),
                "prev_close": float(prev_close)
            }
            
            # 4. Audit Data
            audit_result = market_auditor.detect_anomalies(candle)
            
            result = None
            if audit_result['is_valid']:
                result = {
                    **candle, 
                    "quality_score": audit_result['quality_score'],
                    "source": "yfinance_live"
                }
            else:
                print(f"⚠️ Data Quality Warning for {symbol}: {audit_result['flags']}")
                # result = None # Strict
                # For now return it anyway for debugging
                result = {
                    **candle,
                    "quality_score": audit_result['quality_score'],
                    "source": "yfinance_live_flagged"
                }

            # Update cache
            if result:
                 self._cache[symbol] = (result, now)
            
            return result

        except Exception as e:
            print(f"❌ Fetch Error for {symbol}: {str(e)}")
            return None

data_fetcher = IndianDataFetcher()

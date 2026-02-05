from datetime import datetime, time
import pytz
import pandas as pd
from typing import List, Dict, Optional, Tuple

IST = pytz.timezone('Asia/Kolkata')

class MarketAuditor:
    """
    Enforces Data Quality Rules for Indian Markets (NSE/BSE).
    Reference: INDIAN_MARKET_QUANT_GUIDE.md
    """
    
    def __init__(self):
        self.market_open = time(9, 15)
        self.market_close = time(15, 30)

    def validate_timestamp_ist(self, timestamp: datetime) -> Tuple[bool, str]:
        """Rule A: Timestamp Integrity"""
        if timestamp is None:
            return False, "Timestamp is None"
            
        # Ensure timezone awareness
        if timestamp.tzinfo is None:
            # Assume UTC if naive, convert to IST
            timestamp = pytz.utc.localize(timestamp).astimezone(IST)
        else:
            timestamp = timestamp.astimezone(IST)

        # Market Hours Check
        current_time = timestamp.time()
        if not (self.market_open <= current_time <= self.market_close):
             # Allow slight buffer for pre-open/post-close processing
             if not (time(9, 0) <= current_time <= time(16, 0)):
                return False, f"Outside Market Hours: {current_time}"
        
        return True, "OK"

    def validate_ohlc(self, open_: float, high: float, low: float, close: float, volume: int) -> List[str]:
        """Rule B: OHLC Sanity Checks"""
        errors = []
        
        if any(x < 0 for x in [open_, high, low, close, volume]):
            errors.append("Negative values detected")
            
        if not (low <= open_ <= high):
            errors.append(f"Open ({open_}) outside Low-High range [{low}, {high}]")
            
        if not (low <= close <= high):
            errors.append(f"Close ({close}) outside Low-High range [{low}, {high}]")
            
        if low > high:
            errors.append(f"Low ({low}) > High ({high})")
            
        return errors

    def check_circuit_filters(self, current_price: float, prev_close: float) -> Optional[str]:
        """Rule C: Statistical Outliers / Circuit Filters"""
        if prev_close <= 0:
            return None
            
        change_pct = abs(current_price - prev_close) / prev_close
        
        # Upper/Lower Circuit Logic (Simplified to 20% max for most stocks)
        if change_pct > 0.20:
            return f"Price movement {change_pct*100:.1f}% exceeds 20% circuit limit possibility"
            
        return None

    def detect_anomalies(self, candle: Dict) -> Dict[str, any]:
        """Run all checks on a single data candle"""
        flags = []
        
        # 1. Timestamp
        ts_valid, ts_msg = self.validate_timestamp_ist(candle.get('timestamp'))
        if not ts_valid:
            flags.append(f"TIME_ERR: {ts_msg}")
            
        # 2. OHLC
        ohlc_errs = self.validate_ohlc(
            candle.get('open', 0), 
            candle.get('high', 0), 
            candle.get('low', 0), 
            candle.get('close', 0),
            candle.get('volume', 0)
        )
        flags.extend(ohlc_errs)
        
        # 3. Circuit/Flash Crash
        prev_close = candle.get('prev_close')
        if prev_close:
            circuit_msg = self.check_circuit_filters(candle.get('close', 0), prev_close)
            if circuit_msg:
                flags.append(f"CIRCUIT_ERR: {circuit_msg}")

        # 4. Data Quality Score
        quality_score = 100 - (len(flags) * 20)
        
        return {
            "is_valid": len(flags) == 0,
            "quality_score": max(0, quality_score),
            "flags": flags,
            "clean_data": candle if len(flags) == 0 else None # Don't pass bad data
        }

market_auditor = MarketAuditor()

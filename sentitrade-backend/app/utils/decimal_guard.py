"""
Decimal Guard: Data Sanitization Utility
Ensures all numerical outputs are rounded to 2 decimal places.
Provides INR locale formatting for Indian market display.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Union
import locale

# Try to set Indian locale for currency formatting
try:
    locale.setlocale(locale.LC_ALL, 'en_IN.UTF-8')
except locale.Error:
    try:
        locale.setlocale(locale.LC_ALL, 'en_IN')
    except locale.Error:
        # Fallback - will use manual formatting
        pass


def clean_data(value: Union[float, int, str, None], decimals: int = 2) -> float:
    """
    Round any numerical value to exactly 2 decimal places.
    This is the GLOBAL sanitizer for all price data.
    
    Args:
        value: The value to clean (float, int, or string)
        decimals: Number of decimal places (default 2)
        
    Returns:
        Cleaned float rounded to specified decimals
    """
    if value is None:
        return 0.00
    
    try:
        # Convert to Decimal for precise rounding
        d = Decimal(str(value))
        quantize_str = '0.' + '0' * decimals
        rounded = d.quantize(Decimal(quantize_str), rounding=ROUND_HALF_UP)
        return float(rounded)
    except Exception:
        return 0.00


def format_inr(value: Union[float, int], include_symbol: bool = True) -> str:
    """
    Format a number using Indian numbering system (lakhs, crores).
    Example: 112450 -> ₹1,12,450.00
    
    Args:
        value: The monetary value
        include_symbol: Whether to prepend ₹ symbol
        
    Returns:
        Formatted string in en-IN locale
    """
    cleaned = clean_data(value)
    
    # Manual Indian formatting (since locale might not be available)
    if cleaned < 0:
        sign = '-'
        cleaned = abs(cleaned)
    else:
        sign = ''
    
    # Split into integer and decimal parts
    int_part = int(cleaned)
    dec_part = int(round((cleaned - int_part) * 100))
    
    # Format integer part with Indian grouping
    # First group of 3, then groups of 2
    s = str(int_part)
    if len(s) > 3:
        # Last 3 digits
        last_three = s[-3:]
        # Remaining digits, grouped by 2
        remaining = s[:-3]
        groups = []
        while remaining:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        formatted_int = ','.join(groups) + ',' + last_three
    else:
        formatted_int = s
    
    symbol = '₹' if include_symbol else ''
    return f"{sign}{symbol}{formatted_int}.{dec_part:02d}"


def format_usd(value: Union[float, int], include_symbol: bool = True) -> str:
    """
    Format a number as USD currency.
    Example: 98765.43 -> $98,765.43
    """
    cleaned = clean_data(value)
    symbol = '$' if include_symbol else ''
    return f"{symbol}{cleaned:,.2f}"


def format_percent(value: Union[float, int], include_sign: bool = True) -> str:
    """
    Format a number as percentage with + or - sign.
    Example: 2.5 -> +2.50%
    """
    cleaned = clean_data(value)
    sign = '+' if cleaned > 0 and include_sign else ''
    return f"{sign}{cleaned:.2f}%"


def detect_asset_type(ticker: str) -> str:
    """
    Detect if a ticker is NSE, Crypto, or Commodity.
    
    Returns: 'NSE', 'CRYPTO', 'COMMODITY', or 'UNKNOWN'
    """
    ticker_upper = ticker.upper().strip()
    
    # Crypto patterns
    crypto_pairs = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOT', 'DOGE', 'MATIC', 'LINK', 'AVAX']
    if any(c in ticker_upper for c in crypto_pairs):
        return 'CRYPTO'
    if '-USD' in ticker_upper or '/USD' in ticker_upper or 'USDT' in ticker_upper:
        return 'CRYPTO'
    
    # Commodity patterns
    commodity_tickers = ['GC=F', 'SI=F', 'CL=F', 'NG=F', 'GOLD', 'SILVER', 'CRUDE']
    if any(c in ticker_upper for c in commodity_tickers):
        return 'COMMODITY'
    
    # NSE patterns
    if '.NS' in ticker_upper or '.BO' in ticker_upper:
        return 'NSE'
    
    # Common NSE stocks (fallback heuristic)
    nse_stocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'HDFC', 
                  'BAJFINANCE', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT', 'AXISBANK',
                  'ASIAN', 'MARUTI', 'TITAN', 'NESTLEIND', 'ULTRACEMCO', 'WIPRO',
                  'TATASTEEL', 'NTPC', 'POWERGRID', 'SUNPHARMA', 'TATAMOTORS', 'ADANIENT']
    if ticker_upper in nse_stocks:
        return 'NSE'
    
    return 'UNKNOWN'


def get_mock_price(ticker: str) -> dict:
    """
    Return mock price data when real sources are unavailable.
    Ensures the UI never shows errors - uses last known or synthetic data.
    """
    # Mock data for common assets
    mock_data = {
        'BTC-USD': {'price': 98500.00, 'change_pc': 2.15},
        'ETH-USD': {'price': 3420.50, 'change_pc': 1.82},
        'RELIANCE.NS': {'price': 2985.75, 'change_pc': 0.45},
        'HDFCBANK.NS': {'price': 1580.20, 'change_pc': -0.32},
        'TCS.NS': {'price': 4125.00, 'change_pc': 0.88},
        'INFY.NS': {'price': 1890.50, 'change_pc': 0.15},
        'GC=F': {'price': 2045.30, 'change_pc': 0.28},
        'SI=F': {'price': 24.55, 'change_pc': 0.62},
    }
    
    ticker_upper = ticker.upper()
    if ticker_upper in mock_data:
        data = mock_data[ticker_upper]
    else:
        # Generate synthetic mock
        data = {'price': 100.00, 'change_pc': 0.00}
    
    return {
        'asset': ticker_upper,
        'price': clean_data(data['price']),
        'change_pc': clean_data(data['change_pc']),
        'type': detect_asset_type(ticker),
        'is_mock': True,
        'sentiment': 0.50  # Neutral sentiment placeholder
    }

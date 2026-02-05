"""
History Route
Provides historical OHLC data for any asset type (NSE, Crypto, Commodity).
Compatible with lightweight-charts format.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from ..services.async_data_manager import get_data_manager
from ..utils.decimal_guard import detect_asset_type

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/{ticker}")
async def get_history(
    ticker: str,
    days: int = Query(default=180, ge=1, le=365, description="Number of days of history"),
    interval: str = Query(default="1d", description="Candle interval (1h or 1d)")
):
    """
    Get historical OHLC data for any ticker.
    
    - **ticker**: Asset symbol (e.g., RELIANCE.NS, BTC-USD, GC=F)
    - **days**: Number of days of history (1-365, default 180)
    - **interval**: Candle interval (1h or 1d)
    
    Returns data compatible with lightweight-charts:
    ```json
    [
        {"time": "2025-01-01", "open": 100, "high": 105, "low": 99, "close": 102, "volume": 1000}
    ]
    ```
    """
    try:
        data_manager = get_data_manager()
        
        # Adjust days for crypto (usually less history available)
        asset_type = detect_asset_type(ticker)
        if asset_type == 'CRYPTO' and days > 30:
            days = 30  # Limit crypto history to 30 days for free APIs
        
        history = await data_manager.get_history(ticker, days)
        
        if not history:
            logger.warning(f"No history data for {ticker}")
            return {
                "success": True,
                "ticker": ticker,
                "type": asset_type,
                "days_requested": days,
                "data": [],
                "message": "No historical data available for this ticker"
            }
        
        return {
            "success": True,
            "ticker": ticker,
            "type": asset_type,
            "days_requested": days,
            "count": len(history),
            "data": history
        }
        
    except Exception as e:
        logger.error(f"History endpoint error for {ticker}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch history for {ticker}: {str(e)}"
        )


@router.get("/quote/{ticker}")
async def get_quote(ticker: str):
    """
    Get real-time quote for any ticker.
    
    - **ticker**: Asset symbol (e.g., RELIANCE, BTC, GOLD)
    
    Returns:
    ```json
    {
        "asset": "RELIANCE",
        "price": 2984.50,
        "change_pc": 1.24,
        "type": "NSE",
        "currency": "INR"
    }
    ```
    """
    try:
        data_manager = get_data_manager()
        quote = await data_manager.get_quote(ticker)
        
        return {
            "success": True,
            **quote
        }
        
    except Exception as e:
        logger.error(f"Quote endpoint error for {ticker}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quote for {ticker}: {str(e)}"
        )


@router.get("/latest")
async def get_all_latest():
    """
    Get all latest cached data from the polling loop.
    
    Returns dict of all tracked assets with their latest prices.
    """
    try:
        data_manager = get_data_manager()
        latest = data_manager.get_all_latest()
        
        return {
            "success": True,
            "count": len(latest),
            "data": latest
        }
        
    except Exception as e:
        logger.error(f"Latest endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch latest data: {str(e)}"
        )

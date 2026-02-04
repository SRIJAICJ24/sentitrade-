from fastapi import APIRouter, HTTPException
from app.services.market_data import market_data_service

router = APIRouter()

@router.get("/search")
async def search_market(query: str):
    """Search for assets by ticker or name"""
    if not query:
        return []
    results = await market_data_service.search_assets(query)
    return results

@router.get("/quote/{ticker}")
async def get_quote(ticker: str):
    """Get live quote for a ticker"""
    result = await market_data_service.get_price(ticker)
    if not result.get("success", False) and result.get("price", 0) == 0:
        raise HTTPException(status_code=404, detail="Ticker not found")
    return result

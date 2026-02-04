from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.database import get_db
from app.schemas.portfolio import PortfolioItemResponse, PortfolioCreate, PortfolioSummary
from app.crud import portfolio as crud_portfolio
from app.services.market_data import market_data_service
from app.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=PortfolioSummary)
async def get_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user portfolio with live ROI calculations"""
    items = await crud_portfolio.get_user_portfolio(db, current_user.id)
    
    if not items:
        return {
            "total_value": 0,
            "total_roi": 0,
            "total_roi_percent": 0,
            "items": []
        }
    
    # Enrich with live data
    tickers = list(set(item.ticker for item in items))
    prices = await market_data_service.get_prices(tickers)
    
    enriched_items = []
    total_invested = 0
    total_value = 0
    
    for item in items:
        price_data = prices.get(item.ticker, {})
        current_price = price_data.get("price", 0)
        
        invested = item.buy_price * item.quantity
        value = current_price * item.quantity
        
        total_invested += invested
        total_value += value
        
        roi = value - invested
        roi_percent = (roi / invested * 100) if invested > 0 else 0
        
        enriched_items.append({
            "id": item.id,
            "ticker": item.ticker,
            "quantity": item.quantity,
            "buy_price": item.buy_price,
            "added_at": item.added_at,
            "current_price": current_price,
            "roi": roi,
            "roi_percent": roi_percent
        })
        
    total_roi = total_value - total_invested
    total_roi_percent = (total_roi / total_invested * 100) if total_invested > 0 else 0
    
    return {
        "total_value": total_value,
        "total_roi": total_roi,
        "total_roi_percent": total_roi_percent,
        "items": enriched_items
    }

@router.post("/", response_model=PortfolioItemResponse)
async def add_portfolio_item(
    item: PortfolioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add item to portfolio"""
    # Verify ticker exists (optional, keeping it loose for MVP)
    # Could check market_data_service.search_assets(item.ticker)
    
    db_item = await crud_portfolio.create_portfolio_item(db, item, current_user.id)
    
    # Get immediate price for response
    price_data = await market_data_service.get_price(db_item.ticker)
    current_price = price_data.get("price", 0)
    
    return {
        "id": db_item.id,
        "ticker": db_item.ticker,
        "quantity": db_item.quantity,
        "buy_price": db_item.buy_price,
        "added_at": db_item.added_at,
        "current_price": current_price,
        "roi": 0, # Just added
        "roi_percent": 0
    }

@router.delete("/{item_id}")
async def delete_portfolio_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove item from portfolio"""
    success = await crud_portfolio.delete_portfolio_item(db, item_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}

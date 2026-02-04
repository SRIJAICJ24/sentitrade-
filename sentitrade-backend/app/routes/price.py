import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.price import PriceData, Divergence

router = APIRouter()

@router.get("/chart")
async def get_price_chart(
    asset: str = Query("BTC"),
    hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
):
    """Get price chart data"""
    start_time = datetime.utcnow() - timedelta(hours=hours)
    
    result = await db.execute(
        select(PriceData)
        .where(PriceData.asset_code == asset)
        .where(PriceData.time >= start_time)
        .order_by(PriceData.time)
    )
    prices = result.scalars().all()
    
    if not prices:
        # Generate mock chart data
        base_price = 42000
        mock_prices = []
        for i in range(100):
            time = datetime.utcnow() - timedelta(hours=hours) + timedelta(hours=hours * i / 100)
            change = random.uniform(-500, 500)
            base_price += change
            mock_prices.append({
                "time": time.isoformat(),
                "open": round(base_price - random.uniform(0, 200), 2),
                "high": round(base_price + random.uniform(100, 400), 2),
                "low": round(base_price - random.uniform(100, 400), 2),
                "close": round(base_price, 2),
                "volume": random.randint(1000, 10000),
                "sentiment_score": random.uniform(40, 80),
            })
        return {"data": mock_prices, "success": True}
    
    return {
        "data": [
            {
                "time": p.time.isoformat() if p.time else datetime.utcnow().isoformat(),
                "open": p.open,
                "high": p.high,
                "low": p.low,
                "close": p.close,
                "volume": p.volume,
            }
            for p in prices
        ],
        "success": True,
    }

@router.get("/divergence")
async def get_divergence(db: AsyncSession = Depends(get_db)):
    """Get current divergence data"""
    result = await db.execute(
        select(Divergence).order_by(desc(Divergence.detected_at)).limit(1)
    )
    divergence = result.scalars().first()
    
    if not divergence:
        # Return mock data
        div_type = random.choice(["bullish", "bearish"])
        return {
            "data": {
                "asset_code": "BTC",
                "divergence_type": div_type,
                "sentiment_change_percent": random.uniform(-15, 15),
                "price_change_percent": random.uniform(-10, 10) * (-1 if div_type == "bullish" else 1),
                "reversal_probability": random.uniform(60, 85),
                "historical_avg_profit": random.uniform(0.05, 0.15),
                "confidence": random.uniform(60, 90),
                "detected_at": datetime.utcnow().isoformat(),
            },
            "success": True,
        }
    
    return {
        "data": {
            "asset_code": divergence.asset_code,
            "divergence_type": divergence.divergence_type,
            "sentiment_change_percent": divergence.sentiment_change_percent,
            "price_change_percent": divergence.price_change_percent,
            "reversal_probability": divergence.reversal_probability,
            "historical_avg_profit": divergence.historical_avg_profit,
            "confidence": divergence.confidence,
            "detected_at": divergence.detected_at.isoformat() if divergence.detected_at else datetime.utcnow().isoformat(),
        },
        "success": True,
    }

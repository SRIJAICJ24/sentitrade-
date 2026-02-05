import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.signal import Signal
from app.services.signal_generator import signal_generator

router = APIRouter()

@router.get("/latest")
async def get_latest_signal(db: AsyncSession = Depends(get_db)):
    """Get the latest trading signal"""
    result = await db.execute(
        select(Signal).order_by(desc(Signal.created_at)).limit(1)
    )
    signal = result.scalars().first()
    
    if not signal:
        # Generate mock signal
        mock_signal = await signal_generator.generate_signal_simple(
            sentiment_score=random.uniform(70, 90),
            current_price=0, # Will be ignored by data_fetcher
            volatility=1.8,
            asset="RELIANCE.NS"
        )
        if mock_signal:
            return {"data": mock_signal, "success": True}
        return {"data": None, "success": True, "message": "No signals available"}
    
    return {
        "data": {
            "signal_id": signal.signal_id,
            "asset_code": signal.asset_code,
            "action": signal.action.value if signal.action else "BUY",
            "confidence": signal.confidence,
            "entry_price": signal.entry_price,
            "stop_loss": signal.stop_loss,
            "take_profit": signal.take_profit,
            "position_size_percent": signal.position_size_percent,
            "risk_reward_ratio": signal.risk_reward_ratio,
            "sentiment_score_at_signal": signal.sentiment_score_at_signal,
            "expires_at": signal.expires_at.isoformat() if signal.expires_at else None,
            "created_at": signal.created_at.isoformat() if signal.created_at else None,
        },
        "success": True,
    }

@router.get("/history")
async def get_signal_history(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get signal history"""
    result = await db.execute(
        select(Signal).order_by(desc(Signal.created_at)).limit(limit)
    )
    signals = result.scalars().all()
    
    return {
        "data": {
            "signals": [
                {
                    "signal_id": s.signal_id,
                    "asset_code": s.asset_code,
                    "action": s.action.value if s.action else "BUY",
                    "confidence": s.confidence,
                    "entry_price": s.entry_price,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
                for s in signals
            ],
        },
        "success": True,
    }

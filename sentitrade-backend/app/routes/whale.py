import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.whale import WhaleActivity, SmartMoneyScore

router = APIRouter()

@router.get("/recent")
async def get_recent_whales(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get recent whale transactions"""
    result = await db.execute(
        select(WhaleActivity).order_by(desc(WhaleActivity.timestamp)).limit(limit)
    )
    whales = result.scalars().all()
    
    if not whales:
        # Return mock data
        mock_whales = [
            {
                "wallet_address": f"0x{random.randbytes(20).hex()[:40]}",
                "amount_usd": random.uniform(1000000, 50000000),
                "tx_type": random.choice(["accumulation", "distribution"]),
                "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(1, 120))).isoformat(),
                "trust_score": random.uniform(60, 95),
                "whale_age_days": random.randint(100, 2000),
                "asset_code": "BTC",
            }
            for _ in range(5)
        ]
        return {"data": {"transactions": mock_whales}, "success": True}
    
    return {
        "data": {
            "transactions": [
                {
                    "wallet_address": w.wallet_address,
                    "amount_usd": w.amount_usd,
                    "tx_type": w.tx_type.value if w.tx_type else "accumulation",
                    "timestamp": w.timestamp.isoformat() if w.timestamp else datetime.utcnow().isoformat(),
                    "trust_score": w.trust_score,
                    "whale_age_days": w.whale_age_days,
                    "asset_code": w.asset_code,
                }
                for w in whales
            ],
        },
        "success": True,
    }

@router.get("/smart-money")
async def get_smart_money_score(db: AsyncSession = Depends(get_db)):
    """Get current smart money score"""
    result = await db.execute(
        select(SmartMoneyScore).order_by(desc(SmartMoneyScore.timestamp)).limit(1)
    )
    score = result.scalars().first()
    
    if not score:
        # Return mock data
        return {
            "data": {
                "conviction_score": random.uniform(60, 85),
                "accumulation_vs_distribution_ratio": random.uniform(0.8, 1.5),
                "whale_consensus_percent": random.uniform(50, 80),
                "status": random.choice(["bullish", "neutral", "bearish"]),
                "timestamp": datetime.utcnow().isoformat(),
            },
            "success": True,
        }
    
    return {
        "data": {
            "conviction_score": score.conviction_score,
            "accumulation_vs_distribution_ratio": score.accumulation_vs_distribution_ratio,
            "whale_consensus_percent": score.whale_consensus_percent,
            "status": score.status,
            "timestamp": score.timestamp.isoformat() if score.timestamp else datetime.utcnow().isoformat(),
        },
        "success": True,
    }

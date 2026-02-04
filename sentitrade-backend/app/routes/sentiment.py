from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from app.database import get_db
from app.models.sentiment import Sentiment

router = APIRouter()

@router.get("/overall")
async def get_overall_sentiment(db: AsyncSession = Depends(get_db)):
    """Get current overall sentiment"""
    result = await db.execute(
        select(Sentiment).order_by(desc(Sentiment.created_at)).limit(1)
    )
    sentiment = result.scalars().first()
    
    if not sentiment:
        # Return default if no data
        return {
            "data": {
                "sentiment_score": 50,
                "bullish_count": 0,
                "bearish_count": 0,
                "confidence": 0,
                "sources": {
                    "twitter": {"count": 0, "quality": 0},
                    "reddit": {"count": 0, "quality": 0},
                    "news": {"count": 0, "quality": 0},
                    "discord": {"count": 0, "quality": 0},
                },
                "updated_at": datetime.utcnow().isoformat(),
            },
            "success": True,
        }
    
    return {
        "data": {
            "sentiment_score": sentiment.sentiment_score,
            "bullish_count": sentiment.bullish_count,
            "bearish_count": sentiment.bearish_count,
            "confidence": sentiment.confidence,
            "sources": sentiment.sources,
            "updated_at": sentiment.created_at.isoformat() if sentiment.created_at else datetime.utcnow().isoformat(),
        },
        "success": True,
    }

@router.get("/history")
async def get_sentiment_history(
    hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
):
    """Get sentiment history"""
    start_time = datetime.utcnow() - timedelta(hours=hours)
    
    result = await db.execute(
        select(Sentiment)
        .where(Sentiment.created_at >= start_time)
        .order_by(Sentiment.created_at)
    )
    
    sentiments = result.scalars().all()
    
    return {
        "data": {
            "history": [
                {
                    "timestamp": s.created_at.isoformat() if s.created_at else datetime.utcnow().isoformat(),
                    "sentiment_score": s.sentiment_score,
                    "confidence": s.confidence,
                }
                for s in sentiments
            ],
            "period": f"{hours}h",
        },
        "success": True,
    }

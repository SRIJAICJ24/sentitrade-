import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.alert import AlertPreference, AlertHistory
from app.security import verify_token

router = APIRouter()

class AlertPreferenceUpdate(BaseModel):
    threshold: Optional[str] = None
    enabled: Optional[bool] = None
    channels: Optional[List[str]] = None

@router.get("/preferences")
async def get_alert_preferences(
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """Get user's alert preferences"""
    result = await db.execute(
        select(AlertPreference).where(AlertPreference.user_id == user_id)
    )
    preferences = result.scalars().all()
    
    if not preferences:
        # Return default preferences
        defaults = [
            {"preference_id": "pref_signal", "alert_type": "signal", "threshold": "80", "enabled": True, "channels": ["push", "email"]},
            {"preference_id": "pref_whale", "alert_type": "whale", "threshold": "1000000", "enabled": True, "channels": ["push"]},
            {"preference_id": "pref_sentiment", "alert_type": "sentiment_spike", "threshold": "20", "enabled": False, "channels": ["push"]},
        ]
        return {"data": defaults, "success": True}
    
    return {
        "data": [
            {
                "preference_id": p.preference_id,
                "alert_type": p.alert_type,
                "threshold": p.threshold,
                "enabled": p.enabled,
                "channels": p.channels,
            }
            for p in preferences
        ],
        "success": True,
    }

@router.put("/preferences/{preference_id}")
async def update_alert_preference(
    preference_id: str,
    update: AlertPreferenceUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an alert preference"""
    result = await db.execute(
        select(AlertPreference).where(AlertPreference.preference_id == preference_id)
    )
    preference = result.scalars().first()
    
    if not preference:
        # Create new preference
        preference = AlertPreference(
            preference_id=preference_id,
            user_id="demo-user",
            alert_type=preference_id.replace("pref_", ""),
            threshold=update.threshold or "80",
            enabled=update.enabled if update.enabled is not None else True,
            channels=update.channels or ["push"],
        )
        db.add(preference)
    else:
        if update.threshold is not None:
            preference.threshold = update.threshold
        if update.enabled is not None:
            preference.enabled = update.enabled
        if update.channels is not None:
            preference.channels = update.channels
    
    await db.commit()
    
    return {"success": True, "message": "Preference updated"}

@router.get("/history")
async def get_alert_history(
    limit: int = 20,
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """Get user's alert history"""
    result = await db.execute(
        select(AlertHistory)
        .where(AlertHistory.user_id == user_id)
        .order_by(desc(AlertHistory.sent_at))
        .limit(limit)
    )
    alerts = result.scalars().all()
    
    if not alerts:
        # Return mock history
        mock_alerts = [
            {
                "alert_id": f"alert_{uuid.uuid4().hex[:8]}",
                "alert_type": "signal",
                "content": "New BUY signal detected for BTC with 85% confidence",
                "channel": "push",
                "sent_at": datetime.utcnow().isoformat(),
                "read_at": None,
            },
            {
                "alert_id": f"alert_{uuid.uuid4().hex[:8]}",
                "alert_type": "whale",
                "content": "Whale activity: $15M BTC moved to cold storage",
                "channel": "push",
                "sent_at": datetime.utcnow().isoformat(),
                "read_at": datetime.utcnow().isoformat(),
            },
        ]
        return {"data": mock_alerts, "success": True}
    
    return {
        "data": [
            {
                "alert_id": a.alert_id,
                "alert_type": a.alert_type,
                "content": a.content,
                "channel": a.channel,
                "sent_at": a.sent_at.isoformat() if a.sent_at else datetime.utcnow().isoformat(),
                "read_at": a.read_at.isoformat() if a.read_at else None,
            }
            for a in alerts
        ],
        "success": True,
    }

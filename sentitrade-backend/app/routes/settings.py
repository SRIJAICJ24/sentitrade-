from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from pydantic import BaseModel
from typing import Dict, Optional
from app.database import get_db
from app.security import get_current_user
from app.models.user import User

router = APIRouter()

class SettingsUpdate(BaseModel):
    risk_tolerance: str # conservative, moderate, aggressive
    email_notifications: bool
    sentiment_weights: Optional[Dict[str, float]] = None

@router.put("/")
async def update_settings(
    settings: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user settings"""
    if settings.risk_tolerance not in ["conservative", "moderate", "aggressive"]:
        raise HTTPException(status_code=400, detail="Invalid risk tolerance")
        
    query = (
        update(User)
        .where(User.id == current_user.id)
        .values(
            risk_tolerance=settings.risk_tolerance,
            email_notifications=settings.email_notifications,
            sentiment_weights=settings.sentiment_weights or {}
        )
    )
    await db.execute(query)
    await db.commit()
    
    return {
        "status": "success", 
        "risk_tolerance": settings.risk_tolerance,
        "email_notifications": settings.email_notifications,
        "sentiment_weights": settings.sentiment_weights
    }

@router.get("/")
async def get_settings(
    current_user: User = Depends(get_current_user)
):
    """Get current settings"""
    return {
        "risk_tolerance": current_user.risk_tolerance,
        "email_notifications": current_user.email_notifications,
        "sentiment_weights": current_user.sentiment_weights or {}
    }

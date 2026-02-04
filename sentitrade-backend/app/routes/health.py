from datetime import datetime
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SentiTrade Backend",
        "timestamp": datetime.utcnow().isoformat(),
    }

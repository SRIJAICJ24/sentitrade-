from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class PortfolioBase(BaseModel):
    ticker: str
    quantity: float
    buy_price: float

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioItemResponse(PortfolioBase):
    id: int
    added_at: datetime
    current_price: Optional[float] = None
    roi: Optional[float] = None
    roi_percent: Optional[float] = None

    class Config:
         from_attributes = True

class PortfolioSummary(BaseModel):
    total_value: float
    total_roi: float
    total_roi_percent: float
    items: List[PortfolioItemResponse]

from sqlalchemy import Column, String, Float, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class PriceData(Base):
    __tablename__ = "prices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_code = Column(String, nullable=False, index=True)
    time = Column(DateTime, nullable=False, index=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

class Divergence(Base):
    __tablename__ = "divergences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_code = Column(String, nullable=False, index=True)
    divergence_type = Column(String, nullable=False)  # bullish, bearish
    sentiment_change_percent = Column(Float, nullable=False)
    price_change_percent = Column(Float, nullable=False)
    reversal_probability = Column(Float, nullable=False)  # 0-100
    historical_avg_profit = Column(Float, default=0)
    confidence = Column(Float, default=0)
    detected_at = Column(DateTime, nullable=False, server_default=func.now(), index=True)

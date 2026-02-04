from sqlalchemy import Column, String, Float, Integer, DateTime, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class Sentiment(Base):
    __tablename__ = "sentiment"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sentiment_score = Column(Float, nullable=False)  # 0-100
    bullish_count = Column(Integer, default=0)
    bearish_count = Column(Integer, default=0)
    confidence = Column(Float, default=0)  # 0-100
    sources = Column(JSON, default={})  # {"twitter": {...}, "reddit": {...}}
    created_at = Column(DateTime, server_default=func.now(), index=True)

class SourceWeights(Base):
    __tablename__ = "source_weights"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_name = Column(String, nullable=False)  # twitter, reddit, news, discord
    weight = Column(Float, default=1.0)  # 0.5-2.0
    confidence = Column(Float, default=0.8)  # 0-1.0
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

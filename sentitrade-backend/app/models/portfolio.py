from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ticker = Column(String, index=True, nullable=False)
    quantity = Column(Float, nullable=False)
    buy_price = Column(Float, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to user
    user = relationship("User", back_populates="portfolio_items")
    alerts = relationship("PortfolioAlert", back_populates="portfolio_item", cascade="all, delete-orphan")

class PortfolioAlert(Base):
    __tablename__ = "portfolio_alerts"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_item_id = Column(Integer, ForeignKey("portfolio_items.id"), nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, default="info") # info, warning, critical
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    portfolio_item = relationship("PortfolioItem", back_populates="alerts")

from sqlalchemy import Column, String, Float, DateTime, func, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
import enum

class SignalAction(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"

class Signal(Base):
    __tablename__ = "signals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    signal_id = Column(String, unique=True, nullable=False, index=True)
    asset_code = Column(String, nullable=False)  # BTC, ETH, etc
    action = Column(Enum(SignalAction), nullable=False)
    confidence = Column(Float, nullable=False)  # 0-100
    entry_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    take_profit = Column(Float, nullable=False)
    position_size_percent = Column(Float, nullable=False)
    risk_reward_ratio = Column(Float, nullable=False)
    sentiment_score_at_signal = Column(Float, default=0)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    dismissed_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)

class RiskReward(Base):
    __tablename__ = "risk_reward"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    signal_id = Column(String, nullable=False, index=True)
    risk_amount = Column(Float, nullable=False)
    reward_amount = Column(Float, nullable=False)
    ratio = Column(Float, nullable=False)
    quality_score = Column(Float, default=0)  # 0-100
    historical_win_rate = Column(Float, default=0)  # 0-100
    created_at = Column(DateTime, server_default=func.now())

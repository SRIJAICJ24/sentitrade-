from sqlalchemy import Column, String, Float, Integer, DateTime, func, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
import enum

class TxType(str, enum.Enum):
    ACCUMULATION = "accumulation"
    DISTRIBUTION = "distribution"

class WhaleActivity(Base):
    __tablename__ = "whale_activity"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_address = Column(String, nullable=False, index=True)
    amount_usd = Column(Float, nullable=False)
    tx_type = Column(Enum(TxType), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    trust_score = Column(Float, default=0)  # 0-100
    whale_age_days = Column(Integer, default=0)
    asset_code = Column(String, default="BTC")
    created_at = Column(DateTime, server_default=func.now())

class SmartMoneyScore(Base):
    __tablename__ = "smart_money_score"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conviction_score = Column(Float, nullable=False)  # 0-100
    accumulation_vs_distribution_ratio = Column(Float, default=1.0)
    whale_consensus_percent = Column(Float, default=0)
    status = Column(String, default="neutral")  # bullish, bearish, neutral
    timestamp = Column(DateTime, server_default=func.now(), index=True)

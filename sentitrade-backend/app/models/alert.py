from sqlalchemy import Column, String, Boolean, DateTime, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class AlertPreference(Base):
    __tablename__ = "alert_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    preference_id = Column(String, unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    alert_type = Column(String, nullable=False)  # signal, whale, sentiment_spike
    threshold = Column(String, default="80")  # Varies by type
    enabled = Column(Boolean, default=True)
    channels = Column(JSON, default=["push", "email"])  # ['push', 'email', 'sms']
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class AlertHistory(Base):
    __tablename__ = "alert_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    alert_type = Column(String, nullable=False)
    content = Column(String, nullable=False)
    channel = Column(String, default="push")
    sent_at = Column(DateTime, server_default=func.now(), index=True)
    read_at = Column(DateTime, nullable=True)
    action_taken = Column(String, nullable=True)  # accepted, dismissed, etc

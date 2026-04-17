from pydantic import field_validator
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    # Database - Use SQLite for local dev (no Docker needed)
    database_url: str = "sqlite+aiosqlite:///./sentitrade.db"
    
    # Security
    jwt_secret: str = "your-super-secret-key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    # API
    api_v1_prefix: str = "/api/v1"
    debug: bool = True
    environment: str = "development"
    
    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    
    # Frontend
    frontend_url: str = "http://localhost:5173"
    
    # FinBERT Local AI
    finbert_model: str = "ProsusAI/finbert"
    finbert_cache_dir: str = "./models"
    
    # Market Data (yfinance symbols)
    symbols: List[str] = ["BTC-USD", "AAPL", "GC=F"]  # Crypto, Stock, Gold
    
    # Streaming
    stream_interval_seconds: int = 5

    @field_validator("debug", mode="before")
    @classmethod
    def normalize_debug(cls, value):
        """Accept common environment labels like DEBUG=release."""
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "development", "dev"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "production", "prod"}:
                return False
        return value
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()


import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, WebSocket, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import settings
from app.database import Base
# SentimentStreamer imported lazily in lifespan to avoid blocking startup with FinBERT
from app.ws.manager import WebSocketManager
from app.routes import auth, sentiment, signal, whale, price, alert, health, portfolio, market, settings as settings_router, backtest, xai, history



# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global services
sentiment_streamer = None  # Type: SentimentStreamer | None (imported lazily)
ws_manager = WebSocketManager()

# Database
engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)

# Startup/Shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    # Startup
    logger.info("🚀 Starting SentiTrade Backend...")
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables created")
    
    # Start sentiment streamer in background (non-blocking)
    async def start_streamer_delayed():
        """Start streamer after a delay - imports heavy deps only when called"""
        await asyncio.sleep(3)  # Let API fully start first
        try:
            # Import here to not block startup with FinBERT/transformers imports
            from app.services.sentiment_streamer import SentimentStreamer
            global sentiment_streamer
            sentiment_streamer = SentimentStreamer(async_session_maker, ws_manager)
            logger.info("✅ Starting sentiment streaming (FinBERT will download on first use)...")
            await sentiment_streamer.stream_continuously()
        except Exception as e:
            logger.error(f"Streamer error: {e}")
    
    asyncio.create_task(start_streamer_delayed())
    logger.info("✅ API ready! Sentiment streamer will start in background...")

    # Start Guardian Service
    from app.services.guardian_service import GuardianService
    global guardian_service
    guardian_service = GuardianService(async_session_maker, ws_manager)
    await guardian_service.start()

    # Start Whale Service
    from app.services.whale_service import WhaleService
    global whale_service
    whale_service = WhaleService(async_session_maker, ws_manager)
    await whale_service.start()

    # Start Sovereign Data Manager
    from app.services.async_data_manager import init_data_manager
    global data_manager
    data_manager = init_data_manager(ws_manager)
    await data_manager.start()
    logger.info("✅ Sovereign Data Manager started (15s polling)")    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down SentiTrade Backend...")
    await engine.dispose()

# Create FastAPI app
app = FastAPI(
    title="SentiTrade API",
    description="Real-time cryptocurrency sentiment and trading signal API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(sentiment.router, prefix="/api/v1/sentiment", tags=["Sentiment"])
app.include_router(signal.router, prefix="/api/v1/signal", tags=["Signals"])
app.include_router(whale.router, prefix="/api/v1/whale", tags=["Whales"])
app.include_router(price.router, prefix="/api/v1/price", tags=["Price"])
app.include_router(alert.router, prefix="/api/v1/alert", tags=["Alerts"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["Portfolio"])
app.include_router(market.router, prefix="/api/v1/market", tags=["Market"])
app.include_router(settings_router.router, prefix="/api/v1/settings", tags=["Settings"])
app.include_router(backtest.router, prefix="/api/v1/backtest", tags=["Backtest"])
app.include_router(backtest.router, prefix="/api/v1/backtest", tags=["Backtest"])
app.include_router(xai.router, prefix="/api/v1/xai", tags=["XAI Console"])
app.include_router(history.router, prefix="/api/v1", tags=["History"])
app.include_router(health.router, tags=["Health"])

# Serve Static Files (Frontend)
# Must be AFTER API routes so they take precedence
if os.path.exists("../sentitrade-frontend/dist"):
    app.mount("/assets", StaticFiles(directory="../sentitrade-frontend/dist/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Allow API calls to pass through (just in case regex fails)
        if full_path.startswith("api") or full_path.startswith("auth") or full_path.startswith("ws") or full_path.startswith("assets"):
            return None
            
        # Serve index.html for all other routes (SPA routing)
        return FileResponse("../sentitrade-frontend/dist/index.html")
else:
    logger.warning("Frontend build directory not found. Run 'npm run build' in sentitrade-frontend.")

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket connection for real-time updates"""
    try:
        token = websocket.query_params.get("token")
        user_id = "anonymous"
        
        if token:
            from app.security import verify_token
            verified_user_id = verify_token(token)
            if verified_user_id:
                user_id = verified_user_id
        
        await ws_manager.connect(websocket, user_id)
        
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            # Handle client messages if needed
            logger.debug(f"Received from {user_id}: {data}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await ws_manager.disconnect(user_id if 'user_id' in locals() else None)

# Get DB session dependency
async def get_db() -> AsyncGenerator:
    async with async_session_maker() as session:
        yield session

# Override the get_db dependency
from app import database
database.get_db = get_db

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.debug,
    )

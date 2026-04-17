from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import random
import asyncio

from app.services.sentiment_engine import finbert_engine

router = APIRouter()

class SocialContextRequest(BaseModel):
    ticker: str

class SocialContextResponse(BaseModel):
    ticker: str
    composite_sentiment: float
    sources: dict
    signals: list

# Mock Reddit Scraper
async def scrape_reddit(ticker: str):
    return [
        f"Just moved 50% of my portfolio into {ticker}. Breakout imminent.",
        f"{ticker} looks extremely dangerous right now. Potential massive dump coming.",
        f"The technicals on {ticker} are neutral, hovering around the 200 SMA."
    ]

# Mock NewsAPI Scraper
async def scrape_news(ticker: str):
    return [
        f"Fed policy updates spark massive rally across {ticker} related sectors.",
        f"Geopolitical tensions continue to weigh heavily on {ticker}."
    ]

# Mock X (Twitter) Scraper
async def scrape_twitter(ticker: str):
    return [
        f"Whale alert just flagged a massive accumulation of ${ticker}.",
        f"Retail volume dropping fast on {ticker}..."
    ]

@router.get("/intelligence/{ticker}", response_model=SocialContextResponse)
async def get_social_intelligence(ticker: str):
    """
    WorldMonitor: Hits Reddit, X, and NewsAPI concurrently, 
    then routes through the FinBERT engine for composite convergence.
    """
    try:
        # 1. Fetch concurrently
        reddit, news, twitter = await asyncio.gather(
            scrape_reddit(ticker),
            scrape_news(ticker),
            scrape_twitter(ticker)
        )
        
        all_texts = reddit + news + twitter
        
        # 2. Run NLP Engine Pipeline
        analyzed_signals = await finbert_engine.analyze_batch(all_texts)
        
        # 3. Calculate Composite Mean
        if not analyzed_signals:
            composite = 0.0
        else:
            composite = sum(s["score"] for s in analyzed_signals) / len(analyzed_signals)
            
        return SocialContextResponse(
            ticker=ticker,
            composite_sentiment=round(composite, 3),
            sources={
                "reddit_count": len(reddit),
                "news_count": len(news),
                "twitter_count": len(twitter)
            },
            signals=analyzed_signals
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

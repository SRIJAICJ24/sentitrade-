from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.backtest_engine import backtest_engine

router = APIRouter(prefix="/backtest", tags=["Strategy"])

class BacktestRequest(BaseModel):
    asset: str = "BTC-USD"
    days: int = 180
    capital: float = 10000

@router.post("/run")
async def run_backtest(request: BacktestRequest):
    """
    Run a simulation of the SentiTrade AI strategy.
    Returns equity curve, statistics, and Monte Carlo VaR.
    """
    try:
        results = await backtest_engine.run_backtest(
            asset=request.asset,
            days=request.days,
            initial_capital=request.capital
        )
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

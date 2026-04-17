"""
API Routes for Algorithm Engine
Exposes all 6 AI/Search algorithms as REST endpoints.
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from app.services.algorithm_engine import (
    astar_asset_search,
    bfs_correlation_path,
    dfs_signal_chain,
    minimax_trade_decision,
    csp_portfolio_optimizer,
)

router = APIRouter()


# ── A* Search ──
@router.get("/astar-search")
async def api_astar_search(
    query: str = Query("BTC", description="Search query for assets"),
    top_k: int = Query(5, description="Number of results to return")
):
    """A* Search — ranks assets by f(n) = g(n) + h(n)"""
    # Build the asset universe
    asset_universe = [
        {"name": "BTC-USD", "sentiment": 72, "price": 63500, "change_pc": 2.3},
        {"name": "ETH-USD", "sentiment": 68, "price": 3200, "change_pc": -1.5},
        {"name": "SOL-USD", "sentiment": 55, "price": 145, "change_pc": 5.1},
        {"name": "RELIANCE.NS", "sentiment": 75, "price": 2850, "change_pc": 0.8},
        {"name": "TCS.NS", "sentiment": 65, "price": 3950, "change_pc": -0.3},
        {"name": "INFY.NS", "sentiment": 58, "price": 1580, "change_pc": 1.2},
        {"name": "GOLD", "sentiment": 80, "price": 72000, "change_pc": 0.5},
        {"name": "SILVER", "sentiment": 62, "price": 85000, "change_pc": -0.2},
        {"name": "DOGE-USD", "sentiment": 35, "price": 0.18, "change_pc": -3.2},
        {"name": "AAPL", "sentiment": 70, "price": 185, "change_pc": 1.1},
        {"name": "MSFT", "sentiment": 73, "price": 420, "change_pc": 0.9},
        {"name": "GOOGL", "sentiment": 71, "price": 155, "change_pc": 1.4},
        {"name": "ADA-USD", "sentiment": 48, "price": 0.45, "change_pc": -2.1},
        {"name": "DOT-USD", "sentiment": 52, "price": 7.20, "change_pc": 1.8},
        {"name": "WIPRO.NS", "sentiment": 55, "price": 450, "change_pc": -0.5},
    ]
    return astar_asset_search(query, asset_universe, top_k)


# ── BFS Path ──
@router.get("/bfs-path")
async def api_bfs_path(
    start: str = Query("BTC-USD", description="Starting asset"),
    goal: str = Query("GOLD", description="Target asset")
):
    """BFS — finds shortest correlation path between assets"""
    return bfs_correlation_path(start, goal)


# ── DFS Signal Chain ──
@router.get("/dfs-signals")
async def api_dfs_signals(
    asset: str = Query("BTC-USD", description="Asset to analyze"),
    count: int = Query(30, description="Number of historical signals")
):
    """DFS — finds longest consecutive signal chain"""
    return dfs_signal_chain(asset)


# ── Minimax Decision ──
@router.get("/minimax-decision")
async def api_minimax_decision(
    price: float = Query(63500, description="Current price"),
    sentiment: float = Query(65, description="Current sentiment 0-100"),
    volatility: float = Query(0.3, description="Volatility 0-1"),
    depth: int = Query(4, description="Game tree depth"),
    alpha_beta: bool = Query(True, description="Use Alpha-Beta pruning")
):
    """Minimax + Alpha-Beta — adversarial trading decision"""
    return minimax_trade_decision(price, sentiment, volatility, depth, alpha_beta)


# ── CSP Portfolio ──
class CSPRequest(BaseModel):
    budget: float = 100000
    max_per_asset: float = 0.4
    min_sentiment: float = 40
    max_volatility: float = 0.7
    min_assets: int = 3


@router.post("/csp-optimize")
async def api_csp_optimize(req: CSPRequest):
    """CSP — portfolio allocation under constraints"""
    return csp_portfolio_optimizer(
        budget=req.budget,
        max_per_asset=req.max_per_asset,
        min_sentiment=req.min_sentiment,
        max_volatility=req.max_volatility,
        min_assets=req.min_assets,
    )


# ── All Algorithms Summary ──
@router.get("/summary")
async def api_algorithm_summary():
    """Returns a summary of all available algorithms and their status"""
    return {
        "algorithms": [
            {
                "id": "astar",
                "name": "A* Search",
                "category": "Informed Search (Unit 2)",
                "endpoint": "/astar-search",
                "description": "Ranks assets using f(n)=g(n)+h(n) where g=trade quality, h=query similarity",
                "used_in": "Global Search — optimal asset discovery"
            },
            {
                "id": "bfs",
                "name": "BFS (Breadth-First Search)",
                "category": "Uninformed Search (Unit 2)",
                "endpoint": "/bfs-path",
                "description": "Finds shortest correlation path between assets in a graph",
                "used_in": "Asset Correlation Explorer — discover hidden market connections"
            },
            {
                "id": "dfs",
                "name": "DFS (Depth-First Search)",
                "category": "Uninformed Search (Unit 2)",
                "endpoint": "/dfs-signals",
                "description": "Traverses signal history depth-first to find longest streak",
                "used_in": "Pattern Recognizer — consecutive signal chain detection"
            },
            {
                "id": "minimax",
                "name": "Minimax + Alpha-Beta Pruning",
                "category": "Adversarial Search (Unit 3)",
                "endpoint": "/minimax-decision",
                "description": "Models market as adversary; trader (MAX) vs market (MIN)",
                "used_in": "Signal Generator — optimal BUY/SELL/HOLD decisions"
            },
            {
                "id": "csp",
                "name": "CSP (Constraint Satisfaction)",
                "category": "Constraint Problems (Unit 3)",
                "endpoint": "/csp-optimize",
                "description": "Allocates portfolio budget under multiple constraints",
                "used_in": "Wealth Vault — portfolio optimization with risk/sentiment constraints"
            },
        ]
    }

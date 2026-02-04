import logging
import random
import math
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.services.signal_generator import signal_generator, SignalContext
from app.models.signal import SignalAction

logger = logging.getLogger(__name__)

class BacktestEngine:
    """
    Simulation engine to validate sentiment strategies against historical data.
    Includes Monte Carlo simulation for risk assessment (VaR).
    """
    
    def __init__(self):
        pass

    async def run_backtest(
        self, 
        asset: str = "BTC-USD", 
        days: int = 180, 
        initial_capital: float = 10000
    ) -> Dict:
        """
        Run a simulation of the AI strategy over historical data.
        Since we don't have a full historical sentiment DB yet, we will:
        1. Fetch historical price data (yfinance)
        2. Simulate sentiment signals based on price volatility + random noise (Trend Following Proxy)
        3. Execute trades based on SignalGenerator logic
        """
        logger.info(f"🔙 Starting backtest for {asset} over {days} days...")
        
        # 1. Fetch History (Mocking for now as we need market_data access or direct yfinance)
        # In a real app, integrate market_data_service.get_history(asset, days)
        # Generating synthetic data for demonstration to avoid yfinance latency/limits in this loop
        history = self._generate_synthetic_history(days=days, start_price=40000, volatility=0.04)
        
        capital = initial_capital
        equity_curve = [{"time": history[0]["time"], "value": capital}]
        trades = []
        in_position = False
        entry_price = 0
        position_size = 0
        
        # 2. Replay Loop
        for i in range(1, len(history)):
            bar = history[i]
            prev_bar = history[i-1]
            
            # Simulate "Sentiment" (Trend Following + Noise)
            # If price moved up significantly, sentiment likely rose
            price_change = ((bar["close"] - prev_bar["close"]) / prev_bar["close"]) * 100
            simulated_sentiment = 50 + (price_change * 10) + random.uniform(-10, 10)
            simulated_sentiment = max(0, min(100, simulated_sentiment))
            
            # Context for AI
            ctx = SignalContext(
                asset=asset,
                sentiment_score=simulated_sentiment,
                sentiment_change=0, # Simplified
                price=bar["close"],
                price_change=price_change,
                trend="UP" if price_change > 0 else "DOWN",
                volatility=1.5
            )
            
            # Ask SignalGenerator (Re-using logic)
            # We bypass async for speed in this tight loop or await it
            signal = await signal_generator.generate_signal(ctx, portfolio_size=capital)
            
            # Trading Logic
            if in_position:
                # Check Stop Loss / Take Profit
                curr_price = bar["close"]
                pnl_pct = (curr_price - entry_price) / entry_price
                
                # Exit if Hit SL/TP or Sentiment Crash
                if pnl_pct < -0.05 or pnl_pct > 0.10 or simulated_sentiment < 30:
                    # SELL
                    pnl = position_size * (curr_price - entry_price)
                    capital += position_size * curr_price
                    in_position = False
                    trades.append({
                        "type": "SELL",
                        "price": curr_price,
                        "time": bar["time"],
                        "pnl": pnl
                    })
            
            elif not in_position and signal:
                if signal["action"] == "BUY" and signal["confidence"] > 80:
                    # BUY
                    size_usd = signal["position_size_usd"]
                    if size_usd > capital: size_usd = capital
                    
                    position_size = size_usd / bar["close"]
                    capital -= size_usd
                    entry_price = bar["close"]
                    in_position = True
                    trades.append({
                        "type": "BUY",
                        "price": entry_price,
                        "time": bar["time"],
                        "size": size_usd
                    })

            equity_curve.append({"time": bar["time"], "value": capital + (position_size * bar["close"] if in_position else 0)})

        # 3. Calculate Stats
        final_equity = equity_curve[-1]["value"]
        total_return = ((final_equity - initial_capital) / initial_capital) * 100
        
        # 4. Monte Carlo Simulation (VaR)
        daily_returns = [
            (equity_curve[i]["value"] - equity_curve[i-1]["value"]) / equity_curve[i-1]["value"]
            for i in range(1, len(equity_curve))
        ]
        var_95 = self._monte_carlo_var(daily_returns)

        return {
            "asset": asset,
            "days": days,
            "initial_capital": initial_capital,
            "final_equity": round(final_equity, 2),
            "total_return_pct": round(total_return, 2),
            "trade_count": len(trades),
            "win_rate": self._calculate_win_rate(trades),
            "var_95": round(var_95 * 100, 2), # %
            "equity_curve": equity_curve, # sampled?
            "trades": trades
        }

    def _calculate_win_rate(self, trades: list) -> float:
        sells = [t for t in trades if t["type"] == "SELL"]
        if not sells: return 0.0
        wins = len([t for t in sells if t["pnl"] > 0])
        return round((wins / len(sells)) * 100, 1)

    def _monte_carlo_var(self, returns: list, iterations: int = 1000) -> float:
        """
        Calculate Value at Risk (95% confidence) using Monte Carlo.
        Returns expected max loss % in a day.
        """
        if not returns: return 0.0
        
        simulated_worst_days = []
        for _ in range(iterations):
            # Shuffle returns to simulate different sequences
            shuffled = random.sample(returns, len(returns))
            # Find worst single day in this sequence (simple approach) or draw from distribution
            simulated_worst_days.append(min(shuffled))
            
        simulated_worst_days.sort()
        # 5th percentile (95% confidence)
        cutoff_index = int(iterations * 0.05)
        return abs(simulated_worst_days[cutoff_index])

    def _generate_synthetic_history(self, days: int, start_price: float, volatility: float) -> list:
        data = []
        price = start_price
        start_date = datetime.now() - timedelta(days=days)
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            # Random walk
            change = random.normalvariate(0, volatility)
            price = price * (1 + change)
            data.append({
                "time": date.isoformat(),
                "close": price
            })
        return data

backtest_engine = BacktestEngine()

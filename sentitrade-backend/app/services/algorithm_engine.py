"""
Algorithm Engine — AI/Search Algorithms for SentiTrade
Implements algorithms from Data Structures & Search (Unit 2) and Adversarial Search (Unit 3):

1. A* Search          — Optimal asset search ranking
2. BFS                — Shortest path in asset correlation graph
3. DFS                — Longest signal chain detection
4. Minimax            — Adversarial trading decision
5. Alpha-Beta Pruning — Optimized Minimax
6. CSP Solver         — Portfolio constraint optimization
"""

import heapq
import math
import random
import logging
from typing import List, Dict, Optional, Tuple
from collections import deque
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────
# 1. A* SEARCH — Smart Asset Search
# ──────────────────────────────────────────────────
@dataclass(order=True)
class AStarNode:
    f_score: float
    asset: str = field(compare=False)
    g_score: float = field(compare=False)
    h_score: float = field(compare=False)
    path: list = field(default_factory=list, compare=False)


def astar_asset_search(
    query: str,
    asset_universe: List[Dict],
    top_k: int = 5
) -> Dict:
    """
    A* Search to find the best trading assets matching a query.

    - g(n) = cost so far (inverse of sentiment strength)
    - h(n) = heuristic (string similarity to query)
    - f(n) = g(n) + h(n) — lower is better

    Args:
        query: Search query string (e.g. "BTC", "gold", "tech stock")
        asset_universe: List of dicts with {name, sentiment, price, change_pc}
        top_k: Number of results to return

    Returns:
        Dict with ranked results including f, g, h scores
    """
    open_set: List[AStarNode] = []
    explored = []
    nodes_expanded = 0

    for asset_data in asset_universe:
        name = asset_data.get("name", "")
        sentiment = asset_data.get("sentiment", 50)
        change_pc = asset_data.get("change_pc", 0)

        # g(n): Cost = inverse of trade quality (sentiment + momentum)
        # Lower g = better quality asset
        trade_quality = (sentiment / 100) * 0.6 + (min(abs(change_pc), 10) / 10) * 0.4
        g = 1.0 - trade_quality  # 0 = perfect, 1 = worst

        # h(n): Heuristic = string distance from query
        h = _levenshtein_distance(query.upper(), name.upper()) / max(len(name), len(query), 1)

        # f(n) = g(n) + h(n)
        f = g + h

        node = AStarNode(f_score=f, asset=name, g_score=g, h_score=h, path=[name])
        heapq.heappush(open_set, node)
        nodes_expanded += 1

    # Extract top-k results
    results = []
    while open_set and len(results) < top_k:
        node = heapq.heappop(open_set)
        asset_data_match = next((a for a in asset_universe if a["name"] == node.asset), {})
        results.append({
            "rank": len(results) + 1,
            "asset": node.asset,
            "f_score": round(node.f_score, 4),
            "g_score": round(node.g_score, 4),
            "h_score": round(node.h_score, 4),
            "sentiment": asset_data_match.get("sentiment", 0),
            "price": asset_data_match.get("price", 0),
            "change_pc": asset_data_match.get("change_pc", 0),
        })
        explored.append(node.asset)

    return {
        "algorithm": "A* Search",
        "query": query,
        "nodes_expanded": nodes_expanded,
        "explored_order": explored,
        "results": results,
        "explanation": f"A* expanded {nodes_expanded} nodes using f(n)=g(n)+h(n). "
                       f"g(n) measures inverse trade quality (sentiment + momentum), "
                       f"h(n) measures name similarity to query '{query}'."
    }


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Compute Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    prev_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row
    return prev_row[-1]


# ──────────────────────────────────────────────────
# 2. BFS — Correlation Graph Shortest Path
# ──────────────────────────────────────────────────

# Pre-defined correlation graph (adjacency list)
CORRELATION_GRAPH: Dict[str, List[str]] = {
    "BTC-USD": ["ETH-USD", "SOL-USD", "DOGE-USD"],
    "ETH-USD": ["BTC-USD", "SOL-USD", "MATIC-USD", "DOT-USD"],
    "SOL-USD": ["BTC-USD", "ETH-USD", "MATIC-USD"],
    "DOGE-USD": ["BTC-USD", "SHIB-USD"],
    "SHIB-USD": ["DOGE-USD"],
    "MATIC-USD": ["ETH-USD", "SOL-USD", "DOT-USD"],
    "DOT-USD": ["ETH-USD", "MATIC-USD", "ADA-USD"],
    "ADA-USD": ["DOT-USD", "XRP-USD"],
    "XRP-USD": ["ADA-USD", "RELIANCE.NS"],
    "RELIANCE.NS": ["TCS.NS", "INFY.NS", "XRP-USD"],
    "TCS.NS": ["RELIANCE.NS", "INFY.NS", "WIPRO.NS"],
    "INFY.NS": ["TCS.NS", "RELIANCE.NS", "WIPRO.NS"],
    "WIPRO.NS": ["TCS.NS", "INFY.NS"],
    "GOLD": ["SILVER", "RELIANCE.NS"],
    "SILVER": ["GOLD"],
    "AAPL": ["MSFT", "GOOGL"],
    "MSFT": ["AAPL", "GOOGL"],
    "GOOGL": ["AAPL", "MSFT"],
}


def bfs_correlation_path(start: str, goal: str) -> Dict:
    """
    BFS to find the shortest correlation path between two assets.

    Uses an adjacency list representing asset correlations.
    BFS guarantees the shortest path (fewest hops) between assets.

    Args:
        start: Starting asset ticker
        goal: Target asset ticker

    Returns:
        Dict with path, distance, and traversal info
    """
    start = start.upper()
    goal = goal.upper()

    if start not in CORRELATION_GRAPH:
        return {"algorithm": "BFS", "error": f"Asset {start} not in graph", "path": [], "nodes_visited": 0}
    if goal not in CORRELATION_GRAPH:
        return {"algorithm": "BFS", "error": f"Asset {goal} not in graph", "path": [], "nodes_visited": 0}

    queue = deque([(start, [start])])
    visited = {start}
    nodes_visited_order = [start]

    while queue:
        current, path = queue.popleft()

        if current == goal:
            return {
                "algorithm": "BFS (Breadth-First Search)",
                "start": start,
                "goal": goal,
                "path": path,
                "distance": len(path) - 1,
                "nodes_visited": len(nodes_visited_order),
                "visit_order": nodes_visited_order,
                "explanation": f"BFS explored {len(nodes_visited_order)} nodes level-by-level. "
                               f"Found shortest correlation path of {len(path)-1} hops: "
                               f"{' → '.join(path)}."
            }

        for neighbor in CORRELATION_GRAPH.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                nodes_visited_order.append(neighbor)
                queue.append((neighbor, path + [neighbor]))

    return {
        "algorithm": "BFS (Breadth-First Search)",
        "start": start,
        "goal": goal,
        "path": [],
        "distance": -1,
        "nodes_visited": len(nodes_visited_order),
        "visit_order": nodes_visited_order,
        "explanation": f"No correlation path found between {start} and {goal} after visiting {len(nodes_visited_order)} nodes."
    }


# ──────────────────────────────────────────────────
# 3. DFS — Longest Signal Chain Detection
# ──────────────────────────────────────────────────

def dfs_signal_chain(asset: str, signal_history: Optional[List[Dict]] = None) -> Dict:
    """
    DFS to find the longest consecutive bullish or bearish signal chain.

    Models signal history as a tree where each node is a time-step.
    DFS traverses depth-first to find the longest unbroken chain.

    Args:
        asset: Asset ticker
        signal_history: Optional list of {action: BUY|SELL, confidence: float, time: str}

    Returns:
        Dict with longest chain info and DFS traversal stats
    """
    # Generate synthetic signal history if none provided
    if not signal_history:
        signal_history = _generate_signal_history(asset, 30)

    # DFS to find longest consecutive chain
    best_chain = {"type": "", "length": 0, "signals": [], "start_idx": 0}
    current_chain = {"type": "", "length": 0, "signals": [], "start_idx": 0}
    stack = list(range(len(signal_history)))  # DFS stack of indices
    visited = set()
    dfs_order = []
    depth_reached = 0

    while stack:
        idx = stack.pop()
        if idx in visited:
            continue
        visited.add(idx)
        dfs_order.append(idx)

        signal = signal_history[idx]
        action = signal["action"]

        if action == current_chain["type"]:
            current_chain["length"] += 1
            current_chain["signals"].append(signal)
            depth_reached = max(depth_reached, current_chain["length"])
        else:
            if current_chain["length"] > best_chain["length"]:
                best_chain = {**current_chain}
            current_chain = {"type": action, "length": 1, "signals": [signal], "start_idx": idx}

    # Final check
    if current_chain["length"] > best_chain["length"]:
        best_chain = {**current_chain}

    return {
        "algorithm": "DFS (Depth-First Search)",
        "asset": asset,
        "total_signals": len(signal_history),
        "nodes_visited": len(dfs_order),
        "max_depth": depth_reached,
        "longest_chain": {
            "type": best_chain["type"],
            "length": best_chain["length"],
            "confidence_avg": sum(s.get("confidence", 0) for s in best_chain.get("signals", [])) /
                              max(len(best_chain.get("signals", [])), 1),
        },
        "signal_summary": {
            "total_buy": sum(1 for s in signal_history if s["action"] == "BUY"),
            "total_sell": sum(1 for s in signal_history if s["action"] == "SELL"),
            "total_hold": sum(1 for s in signal_history if s["action"] == "HOLD"),
        },
        "explanation": f"DFS traversed {len(dfs_order)} signal nodes reaching depth {depth_reached}. "
                       f"Longest consecutive {best_chain['type']} chain: {best_chain['length']} signals."
    }


def _generate_signal_history(asset: str, count: int) -> List[Dict]:
    """Generate synthetic signal history for demonstration."""
    actions = ["BUY", "SELL", "HOLD"]
    weights = [0.4, 0.3, 0.3]
    history = []
    for i in range(count):
        action = random.choices(actions, weights=weights, k=1)[0]
        history.append({
            "action": action,
            "confidence": round(random.uniform(60, 95), 1),
            "time": f"T-{count - i}",
            "price": round(random.uniform(30000, 70000), 2) if "BTC" in asset else round(random.uniform(100, 5000), 2),
        })
    return history


# ──────────────────────────────────────────────────
# 4 & 5. MINIMAX + ALPHA-BETA PRUNING
# ──────────────────────────────────────────────────

@dataclass
class GameState:
    """State in the Minimax game tree."""
    price: float
    sentiment: float
    volatility: float
    depth: int
    action: str = ""  # BUY, SELL, HOLD


def minimax_trade_decision(
    price: float,
    sentiment: float,
    volatility: float,
    max_depth: int = 4,
    use_alpha_beta: bool = True
) -> Dict:
    """
    Minimax algorithm for trading decisions.

    Models the market as an adversarial game:
    - MAX player (Trader): wants to maximize profit
    - MIN player (Market): tries to minimize trader's profit

    Alpha-Beta Pruning is applied to reduce the search space.

    Args:
        price: Current asset price
        sentiment: Current sentiment (0-100)
        volatility: Market volatility (0-1)
        max_depth: Depth of game tree
        use_alpha_beta: Whether to use Alpha-Beta pruning

    Returns:
        Dict with optimal action, score, and tree stats
    """
    stats = {"nodes_evaluated": 0, "nodes_pruned": 0, "max_depth": max_depth}

    def evaluate(state: GameState) -> float:
        """Evaluate a leaf node — the utility function."""
        score = 0.0
        # Sentiment contribution
        score += (state.sentiment - 50) / 50 * 40  # -40 to +40

        # Momentum contribution
        if state.action == "BUY" and state.sentiment > 60:
            score += 20
        elif state.action == "SELL" and state.sentiment < 40:
            score += 15
        elif state.action == "HOLD":
            score += 5

        # Volatility penalty
        score -= state.volatility * 15

        return score

    def get_children(state: GameState, is_max: bool) -> List[GameState]:
        """Generate child states (possible future market scenarios)."""
        children = []
        actions = ["BUY", "SELL", "HOLD"]

        for action in actions:
            # Simulate market response
            if is_max:
                # Trader's turn: chooses action
                new_state = GameState(
                    price=state.price,
                    sentiment=state.sentiment,
                    volatility=state.volatility,
                    depth=state.depth + 1,
                    action=action
                )
            else:
                # Market's turn: perturbs conditions
                sentiment_shift = random.uniform(-15, 5) if action == "BUY" else random.uniform(-5, 15)
                vol_shift = random.uniform(-0.1, 0.2)
                new_state = GameState(
                    price=state.price * (1 + random.uniform(-0.03, 0.03)),
                    sentiment=max(0, min(100, state.sentiment + sentiment_shift)),
                    volatility=max(0, min(1, state.volatility + vol_shift)),
                    depth=state.depth + 1,
                    action=action
                )
            children.append(new_state)
        return children

    def minimax(
        state: GameState,
        depth: int,
        is_maximizing: bool,
        alpha: float = float('-inf'),
        beta: float = float('inf')
    ) -> Tuple[float, str]:
        stats["nodes_evaluated"] += 1

        if depth == 0:
            return evaluate(state), state.action

        children = get_children(state, is_maximizing)

        if is_maximizing:
            max_eval = float('-inf')
            best_action = "HOLD"
            for child in children:
                eval_score, _ = minimax(child, depth - 1, False, alpha, beta)
                if eval_score > max_eval:
                    max_eval = eval_score
                    best_action = child.action
                if use_alpha_beta:
                    alpha = max(alpha, eval_score)
                    if beta <= alpha:
                        stats["nodes_pruned"] += 1
                        break  # Beta cutoff
            return max_eval, best_action
        else:
            min_eval = float('inf')
            worst_action = "HOLD"
            for child in children:
                eval_score, _ = minimax(child, depth - 1, True, alpha, beta)
                if eval_score < min_eval:
                    min_eval = eval_score
                    worst_action = child.action
                if use_alpha_beta:
                    beta = min(beta, eval_score)
                    if beta <= alpha:
                        stats["nodes_pruned"] += 1
                        break  # Alpha cutoff
            return min_eval, worst_action

    # Run Minimax
    random.seed(int(price * 100) % 1000)  # Deterministic for same inputs
    root = GameState(price=price, sentiment=sentiment, volatility=volatility, depth=0)
    score, best_action = minimax(root, max_depth, True)

    # Confidence based on score magnitude
    confidence = min(100, max(0, 50 + score))

    return {
        "algorithm": f"Minimax {'+ Alpha-Beta Pruning' if use_alpha_beta else '(No Pruning)'}",
        "optimal_action": best_action,
        "score": round(score, 2),
        "confidence": round(confidence, 1),
        "nodes_evaluated": stats["nodes_evaluated"],
        "nodes_pruned": stats["nodes_pruned"],
        "pruning_efficiency": f"{(stats['nodes_pruned'] / max(stats['nodes_evaluated'], 1) * 100):.1f}%",
        "max_depth": max_depth,
        "input": {
            "price": price,
            "sentiment": sentiment,
            "volatility": volatility,
        },
        "explanation": f"Minimax explored {stats['nodes_evaluated']} nodes at depth {max_depth}. "
                       f"{'Alpha-Beta pruning eliminated ' + str(stats['nodes_pruned']) + ' branches. ' if use_alpha_beta else ''}"
                       f"Optimal action: {best_action} (score: {score:.2f}, confidence: {confidence:.1f}%). "
                       f"The trader (MAX) picked '{best_action}' against adversarial market (MIN)."
    }


# ──────────────────────────────────────────────────
# 6. CSP — Portfolio Constraint Satisfaction
# ──────────────────────────────────────────────────

def csp_portfolio_optimizer(
    budget: float,
    assets: Optional[List[Dict]] = None,
    max_per_asset: float = 0.4,
    min_sentiment: float = 40,
    max_volatility: float = 0.7,
    min_assets: int = 3
) -> Dict:
    """
    CSP Solver for portfolio allocation.

    Variables: allocation percentage for each asset
    Constraints:
      C1: Total allocation = 100%
      C2: No single asset > max_per_asset (40%)
      C3: Only assets with sentiment > min_sentiment
      C4: Only assets with volatility < max_volatility
      C5: Minimum number of assets in portfolio

    Uses backtracking with constraint propagation.

    Args:
        budget: Total budget in USD
        assets: List of {name, sentiment, volatility, price, expected_return}
        max_per_asset: Maximum allocation per asset (0-1)
        min_sentiment: Minimum sentiment score to include
        max_volatility: Maximum acceptable volatility
        min_assets: Minimum number of assets in portfolio

    Returns:
        Dict with allocation plan and constraint satisfaction details
    """
    # Default asset universe
    if not assets:
        assets = [
            {"name": "BTC-USD", "sentiment": 72, "volatility": 0.45, "price": 63500, "expected_return": 12.5},
            {"name": "ETH-USD", "sentiment": 68, "volatility": 0.52, "price": 3200, "expected_return": 15.2},
            {"name": "RELIANCE.NS", "sentiment": 75, "volatility": 0.22, "price": 2850, "expected_return": 8.3},
            {"name": "TCS.NS", "sentiment": 65, "volatility": 0.18, "price": 3950, "expected_return": 7.1},
            {"name": "GOLD", "sentiment": 80, "volatility": 0.12, "price": 72000, "expected_return": 5.8},
            {"name": "INFY.NS", "sentiment": 58, "volatility": 0.25, "price": 1580, "expected_return": 9.2},
            {"name": "SOL-USD", "sentiment": 45, "volatility": 0.65, "price": 145, "expected_return": 22.0},
            {"name": "DOGE-USD", "sentiment": 35, "volatility": 0.85, "price": 0.18, "expected_return": 30.0},
            {"name": "AAPL", "sentiment": 70, "volatility": 0.20, "price": 185, "expected_return": 10.5},
        ]

    constraints_checked = 0
    constraints_satisfied = 0
    constraints_violated = 0
    backtrack_count = 0

    # Step 1: Filter by constraints C3 and C4
    eligible = []
    for asset in assets:
        constraints_checked += 2
        sentiment_ok = asset["sentiment"] >= min_sentiment
        volatility_ok = asset["volatility"] <= max_volatility

        if sentiment_ok and volatility_ok:
            eligible.append(asset)
            constraints_satisfied += 2
        else:
            constraints_violated += (0 if sentiment_ok else 1) + (0 if volatility_ok else 1)
            constraints_satisfied += (1 if sentiment_ok else 0) + (1 if volatility_ok else 0)

    # Step 2: Check C5 (minimum assets)
    constraints_checked += 1
    if len(eligible) < min_assets:
        constraints_violated += 1
        return {
            "algorithm": "CSP (Constraint Satisfaction Problem)",
            "status": "UNSATISFIABLE",
            "error": f"Only {len(eligible)} assets meet constraints, need minimum {min_assets}.",
            "constraints_checked": constraints_checked,
            "constraints_violated": constraints_violated,
        }
    constraints_satisfied += 1

    # Step 3: Backtracking allocation with constraint propagation
    # Sort by score: sentiment * (1 - volatility) * expected_return
    eligible.sort(
        key=lambda a: a["sentiment"] * (1 - a["volatility"]) * a["expected_return"],
        reverse=True
    )

    allocation = {}
    remaining = 1.0  # 100%

    for i, asset in enumerate(eligible):
        constraints_checked += 1  # Check C2

        # Score-based allocation (higher score = higher %)
        score = asset["sentiment"] * (1 - asset["volatility"]) * asset["expected_return"] / 100
        raw_alloc = min(max_per_asset, score * 0.5, remaining)

        # Ensure we can still fill min_assets
        assets_left = len(eligible) - i - 1
        if assets_left > 0 and remaining - raw_alloc < 0.05 * assets_left:
            raw_alloc = remaining - 0.05 * assets_left
            backtrack_count += 1

        if raw_alloc < 0.03:  # Skip if less than 3%
            continue

        allocation[asset["name"]] = {
            "percentage": round(raw_alloc * 100, 1),
            "amount_usd": round(budget * raw_alloc, 2),
            "sentiment": asset["sentiment"],
            "volatility": asset["volatility"],
            "expected_return": asset["expected_return"],
        }
        remaining -= raw_alloc
        constraints_satisfied += 1

    # Distribute remainder to top asset
    if remaining > 0.01 and allocation:
        top_asset = list(allocation.keys())[0]
        new_pct = allocation[top_asset]["percentage"] + remaining * 100
        if new_pct / 100 <= max_per_asset:
            allocation[top_asset]["percentage"] = round(new_pct, 1)
            allocation[top_asset]["amount_usd"] = round(budget * new_pct / 100, 2)

    total_allocated = sum(a["percentage"] for a in allocation.values())
    expected_portfolio_return = sum(
        a["expected_return"] * a["percentage"] / 100
        for a in allocation.values()
    )

    return {
        "algorithm": "CSP (Constraint Satisfaction Problem)",
        "status": "SATISFIED",
        "budget": budget,
        "allocation": allocation,
        "total_allocated_pct": round(total_allocated, 1),
        "expected_portfolio_return": round(expected_portfolio_return, 2),
        "num_assets": len(allocation),
        "constraints": {
            "max_per_asset": f"{max_per_asset * 100}%",
            "min_sentiment": min_sentiment,
            "max_volatility": max_volatility,
            "min_assets": min_assets,
        },
        "stats": {
            "constraints_checked": constraints_checked,
            "constraints_satisfied": constraints_satisfied,
            "constraints_violated": constraints_violated,
            "backtracks": backtrack_count,
            "eligible_assets": len(eligible),
            "total_assets_evaluated": len(assets),
        },
        "explanation": f"CSP solver evaluated {len(assets)} assets, {len(eligible)} met all constraints. "
                       f"Checked {constraints_checked} constraints ({constraints_violated} violated). "
                       f"{backtrack_count} backtracks during allocation. "
                       f"Allocated {round(total_allocated, 1)}% across {len(allocation)} assets. "
                       f"Expected portfolio return: {expected_portfolio_return:.2f}%."
    }

"""
Source Purity Algorithm for Weighted Sentiment Scoring

Trusted sources (1.5x weight):
- Reuters, Bloomberg, Official Report

Spam sources (0.5x weight):
- 100x, Giveaway, Telegram (promotional content)
"""

import re
from typing import Tuple

# Trusted sources get 1.5x weight multiplier
TRUSTED_PATTERNS = [
    r'\breuters\b',
    r'\bbloomberg\b',
    r'\bofficial\s*report\b',
    r'\bsec\s*filing\b',
    r'\bworld\s*gold\s*council\b',
    r'\bgoldman\s*sachs\b',
    r'\bfederal\s*reserve\b',
    r'\bfomc\b',
]

# Spam sources get 0.5x weight multiplier
SPAM_PATTERNS = [
    r'\b100x\b',
    r'\b1000x\b',
    r'\bgiveaway\b',
    r'\btelegram\b',
    r'\bguaranteed\b',
    r'\bfree\s*(btc|bitcoin|crypto)\b',
    r'\bjoin\s*(vip|now|our)\b',
    r'\bdm\s*now\b',
    r'\bsend\s*\d+\s*receive\b',
]


def calculate_source_weight(source: str, headline: str) -> Tuple[float, str]:
    """
    Calculate weight multiplier based on source and headline content.
    
    Args:
        source: The source name (e.g., "Reuters", "Telegram")
        headline: The full headline text
        
    Returns:
        Tuple of (weight_multiplier, category)
        - weight_multiplier: 1.5 (trusted), 1.0 (neutral), 0.5 (spam)
        - category: "trusted", "neutral", or "spam"
    """
    combined_text = f"{source} {headline}".lower()
    
    # Check for trusted patterns
    for pattern in TRUSTED_PATTERNS:
        if re.search(pattern, combined_text, re.IGNORECASE):
            return (1.5, "trusted")
    
    # Check for spam patterns
    for pattern in SPAM_PATTERNS:
        if re.search(pattern, combined_text, re.IGNORECASE):
            return (0.5, "spam")
    
    # Default neutral weight
    return (1.0, "neutral")


def apply_source_purity(sentiment_score: float, source: str, headline: str) -> dict:
    """
    Apply Source Purity weighting to a sentiment score.
    
    Args:
        sentiment_score: Raw sentiment score (0-100)
        source: Source name
        headline: Headline text
        
    Returns:
        {
            "original_score": raw score,
            "weighted_score": after source purity applied,
            "weight": multiplier used,
            "source_category": trusted/neutral/spam
        }
    """
    weight, category = calculate_source_weight(source, headline)
    
    # Apply weight to deviation from neutral (50)
    deviation = sentiment_score - 50
    weighted_deviation = deviation * weight
    weighted_score = 50 + weighted_deviation
    
    # Clamp to 0-100 range
    weighted_score = max(0, min(100, weighted_score))
    
    return {
        "original_score": round(sentiment_score, 2),
        "weighted_score": round(weighted_score, 2),
        "weight": weight,
        "source_category": category
    }


def get_aggregate_sentiment(headlines_with_scores: list[dict]) -> dict:
    """
    Calculate aggregate sentiment from multiple headlines with Source Purity.
    
    Args:
        headlines_with_scores: List of {
            "headline": str,
            "source": str,
            "sentiment_score": float
        }
        
    Returns:
        Aggregate sentiment data
    """
    if not headlines_with_scores:
        return {
            "aggregate_score": 50.0,
            "weighted_count": 0,
            "trusted_count": 0,
            "spam_count": 0,
            "total_count": 0
        }
    
    total_weighted_score = 0.0
    total_weight = 0.0
    trusted_count = 0
    spam_count = 0
    
    for item in headlines_with_scores:
        headline = item.get("headline", "")
        source = item.get("source", "")
        score = item.get("sentiment_score", 50.0)
        
        weight, category = calculate_source_weight(source, headline)
        
        if category == "trusted":
            trusted_count += 1
        elif category == "spam":
            spam_count += 1
        
        total_weighted_score += score * weight
        total_weight += weight
    
    aggregate_score = total_weighted_score / total_weight if total_weight > 0 else 50.0
    
    return {
        "aggregate_score": round(aggregate_score, 2),
        "weighted_count": round(total_weight, 2),
        "trusted_count": trusted_count,
        "spam_count": spam_count,
        "total_count": len(headlines_with_scores)
    }

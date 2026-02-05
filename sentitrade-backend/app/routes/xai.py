import random
import uuid
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models.xai import ChatRequest, ChatResponse, ChatMessage, ThoughtStep

router = APIRouter()

# Mock System Prompt simulation
SYSTEM_PERSONA = """
You are Senti-Quant, an advanced AI market analyst for the NSE/BSE markets.
You focus on "Sentiment Divergence" and "Whale Tracking".
You are skeptical, data-driven, and protective of the user's capital.
"""

@router.post("/chat", response_model=ChatResponse)
async def chat_with_xai(request: ChatRequest):
    """
    Simulates a Llama-3 reasoning chain.
    """
    # 1. Generate "Thinking" Steps (The Internal Monologue)
    thoughts = []
    
    # Step 1: Input Analysis
    thoughts.append(ThoughtStep(
        step_number=1,
        thought=f"Analyzing user query: '{request.message}'",
        level="info",
        timestamp=datetime.utcnow()
    ))
    await asyncio.sleep(0.5) # Simulate processing

    # Step 2: Safety Check
    thoughts.append(ThoughtStep(
        step_number=2,
        thought="🛡️ Running Safety Audit... No prohibited keywords detected.",
        level="success",
        timestamp=datetime.utcnow()
    ))
    await asyncio.sleep(0.3)

    # Step 3: Context Retrieval (Mock)
    if "audit" in request.message.lower() or "portfolio" in request.message.lower():
         thoughts.append(ThoughtStep(
            step_number=3,
            thought="🔍 Retrieving Portfolio Snapshot... Found 5 Assets.",
            level="info",
            timestamp=datetime.utcnow()
        ))
         thoughts.append(ThoughtStep(
            step_number=4,
            thought="⚠️ DETECTED RISK: High exposure to HDFCBANK (40%).",
            level="warning",
            timestamp=datetime.utcnow()
        ))
         reply_text = (
             "I've audited your portfolio. \n\n"
             "**CRITICAL FINDING**: Your exposure to HDFCBANK is **40%**, which exceeds the recommended 15% concentration limit. \n\n"
             "**Sentiment Analysis**: HDFCBANK sentiment is currently **Neutral (52/100)**. \n\n"
             "**Action**: I recommend reducing this position size to hedge against potential sector volatility."
         )

    elif "buy" in request.message.lower() or "recommend" in request.message.lower():
        thoughts.append(ThoughtStep(
            step_number=3,
            thought="📡 Scanning for Bullish Divergence Patterns on NSE...",
            level="info",
            timestamp=datetime.utcnow()
        ))
        thoughts.append(ThoughtStep(
            step_number=4,
            thought="✅ PATTERN MATCH: RELIANCE.NS (Price Down 2%, Sentiment Up 5%)",
            level="success",
            timestamp=datetime.utcnow()
        ))
        reply_text = (
            "Based on current market scan, I detect a **Bullish Divergence** on **RELIANCE.NS**.\n\n"
            "• **Price**: ₹2,943 (Down 1.2%)\n"
            "• **Sentiment**: 78/100 (Spiking)\n"
            "• **Whale Activity**: ₹45Cr Accumulation detected.\n\n"
            "This setup suggests a potential reversal. Monitor for a breakout above ₹2,955."
        )

    else:
        thoughts.append(ThoughtStep(
            step_number=3,
            thought="🤔 Query is general. Retrieving market summary.",
            level="info",
            timestamp=datetime.utcnow()
        ))
        reply_text = (
            "I am Senti-Quant, your AI Market Guardian. \n"
            "Systems are green. Tracking **NSE/BSE** for anomalies.\n\n"
            "You can ask me to:\n"
            "1. Audit your portfolio\n"
            "2. Find buying opportunities\n"
            "3. Explain recent whale movements"
        )

    # Step 4: Finalize
    thoughts.append(ThoughtStep(
        step_number=5,
        thought="Generating natural language response...",
        level="success",
        timestamp=datetime.utcnow()
    ))

    return ChatResponse(
        reply=reply_text,
        thought_chain=thoughts
    )

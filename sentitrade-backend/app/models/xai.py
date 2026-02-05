from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

class ChatMessage(BaseModel):
    id: str
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime

class ChatRequest(BaseModel):
    message: str
    portfolio_context: Optional[dict] = None

class ThoughtStep(BaseModel):
    """Represents a single step in the AI's internal reasoning chain"""
    step_number: int
    thought: str
    level: Literal["info", "warning", "success", "error"]
    timestamp: datetime

class ChatResponse(BaseModel):
    reply: str
    thought_chain: List[ThoughtStep]

import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept new WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        logger.info(f"✅ WebSocket connected: {user_id}")
    
    async def disconnect(self, user_id: str | None):
        """Remove WebSocket connection"""
        if user_id and user_id in self.active_connections:
            # Remove closed connections
            self.active_connections[user_id] = [
                ws for ws in self.active_connections[user_id]
                if ws.client_state.name == "CONNECTED"
            ]
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            
            logger.info(f"❌ WebSocket disconnected: {user_id}")
    
    async def broadcast(self, message: dict):
        """Send message to all connected users"""
        for user_id, connections in list(self.active_connections.items()):
            for websocket in connections:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Broadcast error: {e}")
                    await self.disconnect(user_id)
    
    async def send_to_user(self, user_id: str, message: dict):
        """Send message to specific user"""
        if user_id in self.active_connections:
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Send to user error: {e}")
                    await self.disconnect(user_id)

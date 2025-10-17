"""
SSE Manager para broadcast real-time (Singleton Pattern)
"""
from typing import Dict, AsyncGenerator
import asyncio
import json
from app.cache.redis_client import RedisClient


class SSEManager:
    """Singleton SSE manager usando Redis Pub/Sub"""

    _instance: "SSEManager | None" = None
    _subscribers: Dict[str, asyncio.Queue] = {}
    _pubsub = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._subscribers = {}
        return cls._instance

    @classmethod
    def get_instance(cls) -> "SSEManager":
        """Get SSE manager instance"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def subscribe(self, client_id: str) -> AsyncGenerator[str, None]:
        """Subscribe client to SSE stream"""
        queue = asyncio.Queue()
        self._subscribers[client_id] = queue

        try:
            while True:
                # Wait for messages
                message = await queue.get()
                yield f"data: {json.dumps(message)}\n\n"
        except asyncio.CancelledError:
            # Client disconnected
            pass
        finally:
            # Cleanup
            if client_id in self._subscribers:
                del self._subscribers[client_id]

    async def broadcast(self, event: str, data: dict) -> None:
        """Broadcast event to all connected clients"""
        message = {
            "event": event,
            "data": data,
            "timestamp": data.get("timestamp", ""),
        }

        # Send to all connected clients
        for queue in self._subscribers.values():
            try:
                await queue.put(message)
            except Exception:
                pass

        # Also publish to Redis for multi-worker support
        try:
            redis = await RedisClient.get_instance()
            await redis.publish("sse_events", json.dumps(message))
        except Exception:
            pass

    async def send_to_client(self, client_id: str, event: str, data: dict) -> None:
        """Send event to specific client"""
        if client_id in self._subscribers:
            message = {
                "event": event,
                "data": data,
            }
            await self._subscribers[client_id].put(message)

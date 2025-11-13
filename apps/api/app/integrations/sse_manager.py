"""
SSE Manager para broadcast real-time (Singleton Pattern)
"""
from typing import Dict, AsyncGenerator
import asyncio
import json
import logging
from app.cache.redis_client import RedisClient

logger = logging.getLogger(__name__)


class SSEManager:
    """Singleton SSE manager usando Redis Pub/Sub"""

    _instance: "SSEManager | None" = None
    _subscribers: Dict[str, asyncio.Queue] = {}
    _pubsub = None
    _redis_listener_task = None

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

    async def start_redis_listener(self):
        """Start listening to Redis pub/sub for multi-worker support"""
        if self._redis_listener_task is not None:
            return  # Already running

        try:
            redis = await RedisClient.get_instance()
            pubsub = redis.client.pubsub()
            await pubsub.subscribe("sse_events")

            logger.info("SSE: Started Redis listener for multi-worker support")

            async def listen():
                try:
                    async for message in pubsub.listen():
                        if message["type"] == "message":
                            try:
                                data = json.loads(message["data"])
                                # Broadcast to local subscribers
                                for queue in self._subscribers.values():
                                    try:
                                        await queue.put(data)
                                    except Exception as e:
                                        logger.error(f"Failed to forward Redis message to client: {e}")
                            except json.JSONDecodeError as e:
                                logger.error(f"Failed to parse Redis message: {e}")
                except Exception as e:
                    logger.error(f"Redis listener error: {e}")
                finally:
                    await pubsub.unsubscribe("sse_events")
                    await pubsub.close()

            self._redis_listener_task = asyncio.create_task(listen())
        except Exception as e:
            logger.error(f"Failed to start Redis listener: {e}")

    async def subscribe(self, client_id: str) -> AsyncGenerator[str, None]:
        """Subscribe client to SSE stream with timeout and heartbeat"""
        queue = asyncio.Queue()
        self._subscribers[client_id] = queue

        HEARTBEAT_INTERVAL = 60  # Send heartbeat every 60 seconds
        INACTIVITY_TIMEOUT = 300  # Disconnect after 5 minutes of inactivity
        last_activity = asyncio.get_event_loop().time()

        try:
            while True:
                try:
                    # Wait for messages with timeout for heartbeat
                    message = await asyncio.wait_for(
                        queue.get(),
                        timeout=HEARTBEAT_INTERVAL
                    )
                    last_activity = asyncio.get_event_loop().time()
                    yield f"data: {json.dumps(message)}\n\n"

                except asyncio.TimeoutError:
                    # Send heartbeat or check inactivity
                    current_time = asyncio.get_event_loop().time()

                    # Check inactivity timeout
                    if current_time - last_activity > INACTIVITY_TIMEOUT:
                        logger.info(f"SSE client {client_id} disconnected due to inactivity")
                        break

                    # Send heartbeat ping (SSE comment = no-op for client)
                    yield ": ping\n\n"

        except asyncio.CancelledError:
            # Client disconnected
            logger.info(f"SSE client {client_id} cancelled")
        finally:
            # Cleanup
            if client_id in self._subscribers:
                del self._subscribers[client_id]
                logger.info(f"SSE client {client_id} cleaned up ({len(self._subscribers)} remaining)")

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

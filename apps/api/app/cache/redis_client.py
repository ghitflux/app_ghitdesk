"""
Redis Client (Singleton Pattern)
"""
import redis.asyncio as redis
from app.core.config import get_settings


class RedisClient:
    """Singleton Redis client"""

    _instance: redis.Redis | None = None

    @classmethod
    async def get_instance(cls) -> redis.Redis:
        """Get Redis instance"""
        if cls._instance is None:
            settings = get_settings()
            cls._instance = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
            )
        return cls._instance

    @classmethod
    async def close(cls) -> None:
        """Close Redis connection"""
        if cls._instance:
            await cls._instance.close()
            cls._instance = None

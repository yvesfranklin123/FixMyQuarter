import redis.asyncio as redis
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    _instance: Optional[redis.Redis] = None

    @classmethod
    def get_client(cls) -> redis.Redis:
        """Retourne l'instance unique du client Redis (Singleton)"""
        if cls._instance is None:
            # Création du client si inexistant
            logger.info(f"Connecting to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT}")
            cls._instance = redis.from_url(
                str(settings.REDIS_URL),
                encoding="utf-8",
                decode_responses=True, # Important pour récupérer des str et non des bytes
                # Configuration du Pool Redis
                max_connections=50,
                socket_timeout=5,
                socket_connect_timeout=5
            )
        return cls._instance

    @classmethod
    async def close(cls):
        """Ferme proprement la connexion"""
        if cls._instance:
            await cls._instance.close()
            logger.info("Redis connection closed.")

# Instance prête à l'emploi
redis_client = RedisClient.get_client()

# --- UTILS CACHE ---
# Fonctions helper pour standardiser l'usage du cache

async def get_cache(key: str) -> Optional[str]:
    try:
        return await redis_client.get(key)
    except redis.RedisError as e:
        logger.error(f"Redis READ Error: {e}")
        return None

async def set_cache(key: str, value: str, expire: int = 60 * 5):
    try:
        await redis_client.set(key, value, ex=expire)
    except redis.RedisError as e:
        logger.error(f"Redis WRITE Error: {e}")

async def delete_cache(key: str):
    try:
        await redis_client.delete(key)
    except redis.RedisError as e:
        logger.error(f"Redis DELETE Error: {e}")
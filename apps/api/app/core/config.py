"""
Configuration (Singleton Pattern)
Carrega variáveis de ambiente uma única vez
"""
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded once from environment"""

    # App
    APP_NAME: str = "GhitDesk API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Database - IMPORTANTE: NUNCA usar SQLite
    DATABASE_URL: str
    DATABASE_ECHO: bool = False

    # Database Connection Pool
    DB_POOL_SIZE: int = 20  # Number of connections to keep open
    DB_MAX_OVERFLOW: int = 10  # Additional connections when pool is full
    DB_POOL_RECYCLE: int = 3600  # Recycle connections after 1 hour (seconds)
    DB_POOL_PRE_PING: bool = True  # Test connections before using them

    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_MAX_CONNECTIONS: int = 10

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    JWT_REFRESH_EXPIRATION_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:6006",
    ]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # WhatsApp Integration
    WHATSAPP_API_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: str = "change_me_in_production"

    # Email Integration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""

    # Telegram Integration
    TELEGRAM_BOT_TOKEN: str = ""

    # Security
    COOKIE_SECURE: bool = True  # Set to False only in development
    COOKIE_SAMESITE: str = "lax"  # strict, lax, or none

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    """Get settings instance (singleton per process)"""
    return Settings()

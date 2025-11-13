"""
Database Session Factory (Singleton Pattern)
Garante uma única instância do engine e session factory
IMPORTANTE: NUNCA usar SQLite. Sempre PostgreSQL via Docker.
"""
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.pool import QueuePool
from sqlalchemy.orm import declarative_base
from app.core.config import get_settings

Base = declarative_base()


class DatabaseSessionFactory:
    """Singleton factory for async sessions"""

    _instance: "DatabaseSessionFactory | None" = None
    _engine: AsyncEngine | None = None
    _session_factory: async_sessionmaker[AsyncSession] | None = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def initialize(cls) -> None:
        """Initialize engine and session factory"""
        if cls._engine is not None:
            return

        settings = get_settings()

        # Validar que não está usando SQLite
        if "sqlite" in settings.DATABASE_URL.lower():
            raise ValueError(
                "SQLite não é permitido! Use PostgreSQL via Docker. "
                "Configure DATABASE_URL com postgresql+asyncpg://..."
            )

        cls._engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DATABASE_ECHO,
            poolclass=QueuePool,
            pool_size=settings.DB_POOL_SIZE,  # Connections to keep open
            max_overflow=settings.DB_MAX_OVERFLOW,  # Additional connections
            pool_pre_ping=settings.DB_POOL_PRE_PING,  # Test before use
            pool_recycle=settings.DB_POOL_RECYCLE,  # Recycle after N seconds
            future=True,
        )

        cls._session_factory = async_sessionmaker(
            cls._engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

    @classmethod
    def get_session_factory(cls) -> async_sessionmaker[AsyncSession]:
        """Get session factory"""
        if cls._session_factory is None:
            cls.initialize()
        return cls._session_factory

    @classmethod
    async def close(cls) -> None:
        """Close engine"""
        if cls._engine:
            await cls._engine.dispose()
            cls._engine = None
            cls._session_factory = None


async def get_session():
    """Dependency para injetar session em endpoints"""
    factory = DatabaseSessionFactory.get_session_factory()
    async with factory() as session:
        try:
            yield session
        finally:
            await session.close()

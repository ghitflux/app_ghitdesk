"""FastAPI application"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.database import DatabaseSessionFactory
from app.cache.redis_client import RedisClient
from app.api.routes import auth, webhooks, conversations, tickets, events

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Application starting...")
    print(f"📊 Database URL: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'Not configured'}")

    DatabaseSessionFactory.initialize()
    await RedisClient.get_instance()
    print("✅ Database and Redis initialized")

    yield

    # Shutdown
    print("🛑 Application shutting down...")
    await DatabaseSessionFactory.close()
    await RedisClient.close()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
app.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
app.include_router(events.router, prefix="/events", tags=["events"])


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "app": settings.APP_NAME,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

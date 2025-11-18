"""FastAPI application"""
from contextlib import asynccontextmanager
from uuid import UUID
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.security import decode_token
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


# Multi-tenancy middleware
@app.middleware("http")
async def tenant_context_middleware(request: Request, call_next):
    """
    Extract tenant_id and user_id from JWT token and store in request.state.
    Allows routes to access tenant context via dependency injection.
    Skips auth/health endpoints.
    """
    # Skip middleware for public endpoints
    public_paths = ["/health", "/auth/login", "/docs", "/openapi.json", "/redoc"]
    if any(request.url.path.startswith(path) for path in public_paths):
        return await call_next(request)

    # Extract token from cookie
    access_token = request.cookies.get("access_token")

    if access_token:
        try:
            payload = decode_token(access_token)

            # Extract and store tenant_id and user_id in request state
            user_id_str = payload.get("sub")
            tenant_id_str = payload.get("tenant_id")

            if user_id_str and tenant_id_str:
                request.state.user_id = UUID(user_id_str)
                request.state.tenant_id = UUID(tenant_id_str)

        except Exception:
            # If token is invalid, continue without setting state
            # Routes will handle authorization via dependencies
            pass

    response = await call_next(request)
    return response


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

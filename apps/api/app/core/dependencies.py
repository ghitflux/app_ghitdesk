"""FastAPI dependencies for multi-tenancy and authentication"""
from typing import Annotated
from uuid import UUID
from fastapi import Depends, HTTPException, Request, status, Cookie
from app.core.security import decode_token


async def get_current_tenant_id_from_request(request: Request) -> UUID:
    """
    Extract tenant_id from request state (set by middleware).
    Raises HTTPException if tenant_id is not found.
    """
    if not hasattr(request.state, "tenant_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant context not found. Authentication may be required."
        )
    return request.state.tenant_id


async def get_current_user_id_from_request(request: Request) -> UUID:
    """
    Extract user_id from request state (set by middleware).
    Raises HTTPException if user_id is not found.
    """
    if not hasattr(request.state, "user_id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User context not found. Authentication required."
        )
    return request.state.user_id


async def get_tenant_and_user_from_token(
    access_token: Annotated[str | None, Cookie()] = None
) -> tuple[UUID, UUID]:
    """
    Decode JWT token and extract both tenant_id and user_id.
    Returns tuple of (tenant_id, user_id).
    Raises HTTPException if token is invalid or missing required fields.
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Access token required."
        )

    try:
        payload = decode_token(access_token)

        user_id_str = payload.get("sub")
        tenant_id_str = payload.get("tenant_id")

        if not user_id_str or not tenant_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id or tenant_id"
            )

        return UUID(tenant_id_str), UUID(user_id_str)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}"
        )


# Type aliases for cleaner dependency injection
TenantId = Annotated[UUID, Depends(get_current_tenant_id_from_request)]
UserId = Annotated[UUID, Depends(get_current_user_id_from_request)]

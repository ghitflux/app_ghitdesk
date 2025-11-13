"""
Authentication dependencies for protected routes
"""
from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from uuid import UUID
from typing import Optional

from app.db.database import get_session
from app.models.user import User
from app.core.config import get_settings

settings = get_settings()


async def get_current_user(
    access_token: Optional[str] = Cookie(None),
    session: AsyncSession = Depends(get_session),
) -> User:
    """
    Get current authenticated user from JWT token in cookie

    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not access_token:
        raise credentials_exception

    try:
        # Decode JWT token
        payload = jwt.decode(
            access_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )

        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        # Get user from database
        user = await session.get(User, UUID(user_id))
        if user is None:
            raise credentials_exception

        return user

    except JWTError:
        raise credentials_exception
    except ValueError:  # Invalid UUID
        raise credentials_exception


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current user and verify they are active

    Can be extended to check:
    - if user.is_active
    - if user.is_verified
    - etc.
    """
    # TODO: Add is_active check when field is added to User model
    # if not current_user.is_active:
    #     raise HTTPException(status_code=400, detail="Inactive user")

    return current_user


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Require user to be admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return current_user

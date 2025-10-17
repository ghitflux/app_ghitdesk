"""Auth service"""
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from app.db.repositories.user import UserRepository
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User


class AuthService:
    """Authentication service"""

    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user"""
        user = await self.user_repo.get_active_by_email(email)

        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    def create_tokens(self, user: User) -> dict[str, str]:
        """Create access and refresh tokens"""
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        }

        return {
            "access_token": create_access_token(payload),
            "refresh_token": create_refresh_token(payload),
        }

    async def get_current_user(self, token: str) -> User:
        """Get current user from token"""
        try:
            payload = decode_token(token)
            user_id: str = payload.get("sub")

            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token",
                )

            user = await self.user_repo.get(UUID(user_id))

            if user is None or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive",
                )

            return user

        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

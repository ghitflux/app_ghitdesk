"""User repository"""
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Role


class UserRepository:
    """User repository with custom methods"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, id: UUID) -> Optional[User]:
        """Get user by ID"""
        result = await self.session.execute(
            select(User).where(User.id == id)
        )
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalars().first()

    async def get_active_by_email(self, email: str) -> Optional[User]:
        """Get active user by email"""
        result = await self.session.execute(
            select(User).where(
                User.email == email,
                User.is_active == True,
            )
        )
        return result.scalars().first()

    async def create(self, name: str, email: str, password_hash: str, role: Role = Role.AGENT) -> User:
        """Create user"""
        user = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role=role,
            is_active=True,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

"""Tenant repository"""
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tenant import Tenant


class TenantRepository:
    """Repository for Tenant operations"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, tenant_id: UUID) -> Optional[Tenant]:
        """Get tenant by ID"""
        query = select(Tenant).where(Tenant.id == tenant_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Tenant]:
        """Get tenant by slug"""
        query = select(Tenant).where(Tenant.slug == slug)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_active_by_slug(self, slug: str) -> Optional[Tenant]:
        """Get active tenant by slug"""
        query = select(Tenant).where(
            Tenant.slug == slug,
            Tenant.is_active == True
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create(
        self,
        name: str,
        slug: str,
        is_active: bool = True,
    ) -> Tenant:
        """Create a new tenant"""
        tenant = Tenant(
            name=name,
            slug=slug,
            is_active=is_active,
        )
        self.session.add(tenant)
        await self.session.commit()
        await self.session.refresh(tenant)
        return tenant

    async def list_all(self, active_only: bool = False) -> list[Tenant]:
        """List all tenants"""
        query = select(Tenant)
        if active_only:
            query = query.where(Tenant.is_active == True)

        query = query.order_by(Tenant.created_at.desc())

        result = await self.session.execute(query)
        return list(result.scalars().all())

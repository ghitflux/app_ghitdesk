"""User model"""
from sqlalchemy import String, Enum as SQLEnum, Boolean, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from enum import Enum
from datetime import datetime
from uuid import uuid4, UUID
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.tenant import Tenant


class Role(str, Enum):
    ADMIN = "admin"
    SUPERVISOR = "supervisor"
    AGENT = "agent"


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )
    tenant_id: Mapped[UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(
        SQLEnum(Role),
        default=Role.AGENT,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="users")

    __table_args__ = (
        Index("ix_users_tenant_email", "tenant_id", "email", unique=True),
        Index("ix_users_email_is_active", "email", "is_active"),
    )

"""Tenant model for multi-tenancy support"""
from sqlalchemy import String, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from datetime import datetime
from uuid import uuid4, UUID
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.contact import Contact
    from app.models.conversation import Conversation
    from app.models.message import Message
    from app.models.ticket import Ticket


class Tenant(Base):
    """Tenant model for isolating customer data in multi-tenant architecture"""
    __tablename__ = "tenants"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
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
    users: Mapped[list["User"]] = relationship("User", back_populates="tenant")
    contacts: Mapped[list["Contact"]] = relationship("Contact", back_populates="tenant")
    conversations: Mapped[list["Conversation"]] = relationship("Conversation", back_populates="tenant")
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="tenant")
    tickets: Mapped[list["Ticket"]] = relationship("Ticket", back_populates="tenant")

    __table_args__ = (
        Index("ix_tenants_slug_is_active", "slug", "is_active"),
    )

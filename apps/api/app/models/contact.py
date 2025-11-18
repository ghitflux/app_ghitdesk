"""Contact model"""
from sqlalchemy import String, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from datetime import datetime
from uuid import uuid4, UUID
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.tenant import Tenant


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True, index=True)

    # Metadata
    metadata_: Mapped[dict] = mapped_column(default=dict, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="contacts")

    __table_args__ = (
        Index("ix_contacts_tenant_phone", "tenant_id", "phone"),
        Index("ix_contacts_tenant_email", "tenant_id", "email"),
        Index("ix_contacts_phone_email", "phone", "email"),
    )

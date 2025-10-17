"""Ticket model"""
from sqlalchemy import String, Enum as SQLEnum, ForeignKey, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from enum import Enum
from datetime import datetime
from uuid import uuid4, UUID


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # Human-readable ID
    ticket_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)

    # Relations
    conversation_id: Mapped[UUID] = mapped_column(ForeignKey("conversations.id"), nullable=False, index=True)
    assignee_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)

    # Data
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    priority: Mapped[TicketPriority] = mapped_column(
        SQLEnum(TicketPriority),
        default=TicketPriority.MEDIUM,
        nullable=False,
        index=True,
    )
    status: Mapped[TicketStatus] = mapped_column(
        SQLEnum(TicketStatus),
        default=TicketStatus.OPEN,
        nullable=False,
        index=True,
    )

    # SLA
    resolution_due_at: Mapped[datetime] = mapped_column(nullable=True, index=True)
    resolved_at: Mapped[datetime] = mapped_column(nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    conversation = relationship("Conversation", backref="tickets")
    assignee = relationship("User", backref="assigned_tickets")

    __table_args__ = (
        Index("ix_tickets_status_priority", "status", "priority"),
        Index("ix_tickets_assignee_status", "assignee_id", "status"),
        Index("ix_tickets_sla_due", "resolution_due_at"),
    )

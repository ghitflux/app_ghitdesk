"""Conversation model"""
from sqlalchemy import String, Enum as SQLEnum, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from enum import Enum
from datetime import datetime
from uuid import uuid4, UUID


class Channel(str, Enum):
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    TELEGRAM = "telegram"
    TWITTER = "twitter"


class ConversationStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # Relations
    contact_id: Mapped[UUID] = mapped_column(ForeignKey("contacts.id"), nullable=False, index=True)
    assigned_agent_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)

    # Data
    channel: Mapped[Channel] = mapped_column(SQLEnum(Channel), nullable=False, index=True)
    status: Mapped[ConversationStatus] = mapped_column(
        SQLEnum(ConversationStatus),
        default=ConversationStatus.OPEN,
        nullable=False,
        index=True,
    )

    # External IDs
    external_id: Mapped[str] = mapped_column(String(255), nullable=True, unique=True, index=True)

    # Counts
    unread_count: Mapped[int] = mapped_column(default=0, nullable=False)

    # Timestamps
    last_message_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    contact = relationship("Contact", backref="conversations")
    assigned_agent = relationship("User", backref="conversations")
    # messages = relationship("Message", back_populates="conversation")

    __table_args__ = (
        Index("ix_conversations_status_channel", "status", "channel"),
        Index("ix_conversations_agent_status", "assigned_agent_id", "status"),
    )

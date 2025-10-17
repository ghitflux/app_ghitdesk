"""Message model"""
from sqlalchemy import String, Enum as SQLEnum, ForeignKey, Text, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from enum import Enum
from datetime import datetime
from uuid import uuid4, UUID


class MessageDirection(str, Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class MessageStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # Relations
    conversation_id: Mapped[UUID] = mapped_column(ForeignKey("conversations.id"), nullable=False, index=True)
    sender_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)

    # Data
    direction: Mapped[MessageDirection] = mapped_column(SQLEnum(MessageDirection), nullable=False)
    status: Mapped[MessageStatus] = mapped_column(
        SQLEnum(MessageStatus),
        default=MessageStatus.PENDING,
        nullable=False,
    )

    body: Mapped[str] = mapped_column(Text, nullable=False)

    # External IDs (para deduplicação)
    provider_message_id: Mapped[str] = mapped_column(String(255), nullable=True, unique=True, index=True)

    # Flags
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Metadata
    metadata_: Mapped[dict] = mapped_column(default=dict, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    conversation = relationship("Conversation", backref="messages")
    sender_user = relationship("User", backref="sent_messages")

    __table_args__ = (
        Index("ix_messages_conversation_created", "conversation_id", "created_at"),
    )

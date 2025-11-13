"""
Conversation utilities with atomic operations to prevent race conditions
"""
from sqlalchemy import update, select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.models.conversation import Conversation
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def increment_unread_count(
    session: AsyncSession,
    conversation_id: UUID,
    amount: int = 1
) -> None:
    """
    Atomically increment unread count for a conversation
    Prevents race condition by using SQL-level increment
    """
    try:
        await session.execute(
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(
                unread_count=Conversation.unread_count + amount,
                last_message_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        )
        await session.commit()
        logger.debug(f"Incremented unread count for conversation {conversation_id} by {amount}")
    except Exception as e:
        await session.rollback()
        logger.error(f"Failed to increment unread count: {e}")
        raise


async def reset_unread_count(
    session: AsyncSession,
    conversation_id: UUID
) -> None:
    """
    Atomically reset unread count to 0 (when agent reads messages)
    """
    try:
        await session.execute(
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(
                unread_count=0,
                updated_at=datetime.utcnow()
            )
        )
        await session.commit()
        logger.debug(f"Reset unread count for conversation {conversation_id}")
    except Exception as e:
        await session.rollback()
        logger.error(f"Failed to reset unread count: {e}")
        raise


async def get_unread_count(
    session: AsyncSession,
    conversation_id: UUID
) -> int:
    """
    Get current unread count for a conversation
    """
    result = await session.execute(
        select(Conversation.unread_count)
        .where(Conversation.id == conversation_id)
    )
    count = result.scalar()
    return count if count is not None else 0

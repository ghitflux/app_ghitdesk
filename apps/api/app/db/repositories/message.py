"""Message repository"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.message import Message, MessageDirection, MessageStatus


class MessageRepository:
    """Message repository with custom query methods"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, id: UUID) -> Optional[Message]:
        """Get message by ID"""
        result = await self.session.execute(
            select(Message).where(Message.id == id)
        )
        return result.scalars().first()

    async def get_by_provider_id(self, provider_message_id: str) -> Optional[Message]:
        """Get message by provider message ID (for deduplication)"""
        result = await self.session.execute(
            select(Message).where(Message.provider_message_id == provider_message_id)
        )
        return result.scalars().first()

    async def list_by_conversation(
        self,
        conversation_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Message]:
        """List messages in a conversation"""
        query = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count_by_conversation(
        self,
        conversation_id: UUID,
        is_read: Optional[bool] = None,
    ) -> int:
        """Count messages in a conversation"""
        query = select(func.count(Message.id)).where(
            Message.conversation_id == conversation_id
        )

        if is_read is not None:
            query = query.where(Message.is_read == is_read)

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def count_unread_by_conversation(self, conversation_id: UUID) -> int:
        """Count unread messages in a conversation"""
        return await self.count_by_conversation(conversation_id, is_read=False)

    async def create(
        self,
        conversation_id: UUID,
        direction: MessageDirection,
        body: str,
        sender_user_id: Optional[UUID] = None,
        provider_message_id: Optional[str] = None,
        status: MessageStatus = MessageStatus.PENDING,
        metadata: Optional[dict] = None,
    ) -> Message:
        """Create new message"""
        message = Message(
            conversation_id=conversation_id,
            direction=direction,
            body=body,
            sender_user_id=sender_user_id,
            provider_message_id=provider_message_id,
            status=status,
            is_read=False,
            metadata_=metadata or {},
        )
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def update_status(
        self,
        id: UUID,
        status: MessageStatus
    ) -> Optional[Message]:
        """Update message status"""
        message = await self.get(id)
        if message:
            message.status = status
            await self.session.commit()
            await self.session.refresh(message)
        return message

    async def mark_as_read(self, id: UUID) -> Optional[Message]:
        """Mark message as read"""
        message = await self.get(id)
        if message:
            message.is_read = True
            await self.session.commit()
            await self.session.refresh(message)
        return message

    async def mark_conversation_messages_as_read(
        self,
        conversation_id: UUID,
        direction: Optional[MessageDirection] = None
    ) -> int:
        """
        Mark all messages in a conversation as read
        Returns number of messages updated
        """
        from sqlalchemy import update

        query = (
            update(Message)
            .where(
                and_(
                    Message.conversation_id == conversation_id,
                    Message.is_read == False
                )
            )
            .values(is_read=True)
        )

        if direction:
            query = query.where(Message.direction == direction)

        result = await self.session.execute(query)
        await self.session.commit()
        return result.rowcount

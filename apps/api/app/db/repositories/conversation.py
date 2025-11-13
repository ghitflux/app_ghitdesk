"""Conversation repository"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conversation import Conversation, ConversationStatus, Channel


class ConversationRepository:
    """Conversation repository with custom query methods"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, id: UUID) -> Optional[Conversation]:
        """Get conversation by ID"""
        result = await self.session.execute(
            select(Conversation).where(Conversation.id == id)
        )
        return result.scalars().first()

    async def get_by_external_id(self, external_id: str) -> Optional[Conversation]:
        """Get conversation by external ID (e.g., WhatsApp phone number)"""
        result = await self.session.execute(
            select(Conversation).where(Conversation.external_id == external_id)
        )
        return result.scalars().first()

    async def list(
        self,
        status: Optional[ConversationStatus] = None,
        channel: Optional[Channel] = None,
        assigned_agent_id: Optional[UUID] = None,
        contact_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Conversation]:
        """List conversations with filters"""
        query = select(Conversation)

        if status:
            query = query.where(Conversation.status == status)
        if channel:
            query = query.where(Conversation.channel == channel)
        if assigned_agent_id:
            query = query.where(Conversation.assigned_agent_id == assigned_agent_id)
        if contact_id:
            query = query.where(Conversation.contact_id == contact_id)

        query = query.order_by(Conversation.last_message_at.desc())
        query = query.offset(skip).limit(limit)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(
        self,
        status: Optional[ConversationStatus] = None,
        channel: Optional[Channel] = None,
        assigned_agent_id: Optional[UUID] = None,
        contact_id: Optional[UUID] = None,
    ) -> int:
        """Count conversations with filters"""
        query = select(func.count(Conversation.id))

        if status:
            query = query.where(Conversation.status == status)
        if channel:
            query = query.where(Conversation.channel == channel)
        if assigned_agent_id:
            query = query.where(Conversation.assigned_agent_id == assigned_agent_id)
        if contact_id:
            query = query.where(Conversation.contact_id == contact_id)

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def create(
        self,
        contact_id: UUID,
        channel: Channel,
        external_id: Optional[str] = None,
        assigned_agent_id: Optional[UUID] = None,
    ) -> Conversation:
        """Create new conversation"""
        conversation = Conversation(
            contact_id=contact_id,
            channel=channel,
            external_id=external_id,
            status=ConversationStatus.OPEN,
            assigned_agent_id=assigned_agent_id,
            unread_count=0,
            last_message_at=datetime.utcnow(),
        )
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def update_status(
        self,
        id: UUID,
        status: ConversationStatus
    ) -> Optional[Conversation]:
        """Update conversation status"""
        conversation = await self.get(id)
        if conversation:
            conversation.status = status
            await self.session.commit()
            await self.session.refresh(conversation)
        return conversation

    async def assign_agent(
        self,
        id: UUID,
        agent_id: Optional[UUID]
    ) -> Optional[Conversation]:
        """Assign conversation to agent (None to unassign)"""
        conversation = await self.get(id)
        if conversation:
            conversation.assigned_agent_id = agent_id
            await self.session.commit()
            await self.session.refresh(conversation)
        return conversation

    async def update_last_message_time(
        self,
        id: UUID,
        timestamp: Optional[datetime] = None
    ) -> Optional[Conversation]:
        """Update last message timestamp"""
        conversation = await self.get(id)
        if conversation:
            conversation.last_message_at = timestamp or datetime.utcnow()
            await self.session.commit()
            await self.session.refresh(conversation)
        return conversation

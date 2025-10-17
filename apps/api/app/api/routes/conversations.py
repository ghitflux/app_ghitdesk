"""Conversation routes"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_session
from app.models.conversation import Conversation, ConversationStatus, Channel
from typing import List, Optional

router = APIRouter()


@router.get("/")
async def list_conversations(
    status: Optional[ConversationStatus] = None,
    channel: Optional[Channel] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """List conversations with filters"""
    query = select(Conversation)

    if status:
        query = query.where(Conversation.status == status)
    if channel:
        query = query.where(Conversation.channel == channel)

    query = query.order_by(Conversation.last_message_at.desc())
    query = query.offset(skip).limit(limit)

    result = await session.execute(query)
    conversations = result.scalars().all()

    # Count total
    count_query = select(func.count(Conversation.id))
    if status:
        count_query = count_query.where(Conversation.status == status)
    if channel:
        count_query = count_query.where(Conversation.channel == channel)

    total_result = await session.execute(count_query)
    total = total_result.scalar()

    return {
        "conversations": [
            {
                "id": str(conv.id),
                "channel": conv.channel.value,
                "status": conv.status.value,
                "unread_count": conv.unread_count,
                "last_message_at": conv.last_message_at.isoformat(),
                "created_at": conv.created_at.isoformat(),
            }
            for conv in conversations
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get conversation by ID"""
    from uuid import UUID

    result = await session.execute(
        select(Conversation).where(Conversation.id == UUID(conversation_id))
    )
    conversation = result.scalars().first()

    if not conversation:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "id": str(conversation.id),
        "channel": conversation.channel.value,
        "status": conversation.status.value,
        "unread_count": conversation.unread_count,
        "last_message_at": conversation.last_message_at.isoformat(),
        "created_at": conversation.created_at.isoformat(),
    }

"""Ticket repository"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ticket import Ticket, TicketStatus, TicketPriority


class TicketRepository:
    """Ticket repository with custom query methods"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, id: UUID) -> Optional[Ticket]:
        """Get ticket by ID"""
        result = await self.session.execute(
            select(Ticket).where(Ticket.id == id)
        )
        return result.scalars().first()

    async def get_by_number(self, ticket_number: str) -> Optional[Ticket]:
        """Get ticket by ticket number"""
        result = await self.session.execute(
            select(Ticket).where(Ticket.ticket_number == ticket_number)
        )
        return result.scalars().first()

    async def list(
        self,
        status: Optional[TicketStatus] = None,
        priority: Optional[TicketPriority] = None,
        assigned_agent_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Ticket]:
        """List tickets with filters"""
        query = select(Ticket)

        if status:
            query = query.where(Ticket.status == status)
        if priority:
            query = query.where(Ticket.priority == priority)
        if assigned_agent_id:
            query = query.where(Ticket.assigned_agent_id == assigned_agent_id)

        query = query.order_by(Ticket.created_at.desc())
        query = query.offset(skip).limit(limit)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(
        self,
        status: Optional[TicketStatus] = None,
        priority: Optional[TicketPriority] = None,
        assigned_agent_id: Optional[UUID] = None,
    ) -> int:
        """Count tickets with filters"""
        query = select(func.count(Ticket.id))

        if status:
            query = query.where(Ticket.status == status)
        if priority:
            query = query.where(Ticket.priority == priority)
        if assigned_agent_id:
            query = query.where(Ticket.assigned_agent_id == assigned_agent_id)

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def create(
        self,
        ticket_number: str,
        title: str,
        description: str,
        priority: TicketPriority,
        contact_id: UUID,
        conversation_id: Optional[UUID] = None,
        assigned_agent_id: Optional[UUID] = None,
    ) -> Ticket:
        """Create new ticket"""
        ticket = Ticket(
            ticket_number=ticket_number,
            title=title,
            description=description,
            priority=priority,
            status=TicketStatus.OPEN,
            contact_id=contact_id,
            conversation_id=conversation_id,
            assigned_agent_id=assigned_agent_id,
        )
        self.session.add(ticket)
        await self.session.commit()
        await self.session.refresh(ticket)
        return ticket

    async def update_status(self, id: UUID, status: TicketStatus) -> Optional[Ticket]:
        """Update ticket status"""
        ticket = await self.get(id)
        if ticket:
            ticket.status = status
            await self.session.commit()
            await self.session.refresh(ticket)
        return ticket

    async def assign_agent(self, id: UUID, agent_id: UUID) -> Optional[Ticket]:
        """Assign ticket to agent"""
        ticket = await self.get(id)
        if ticket:
            ticket.assigned_agent_id = agent_id
            await self.session.commit()
            await self.session.refresh(ticket)
        return ticket

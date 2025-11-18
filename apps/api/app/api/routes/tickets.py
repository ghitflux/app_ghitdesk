"""Ticket routes"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_session
from app.core.dependencies import TenantId
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.services.sla_service import SLAService
from datetime import datetime
from typing import Optional
from uuid import UUID

router = APIRouter()


@router.get("/")
async def list_tickets(
    tenant_id: TenantId,
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """List tickets with filters (tenant-scoped)"""
    query = select(Ticket).where(Ticket.tenant_id == tenant_id)

    if status:
        query = query.where(Ticket.status == status)
    if priority:
        query = query.where(Ticket.priority == priority)

    query = query.order_by(Ticket.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await session.execute(query)
    tickets = result.scalars().all()

    # Count total
    count_query = select(func.count(Ticket.id)).where(Ticket.tenant_id == tenant_id)
    if status:
        count_query = count_query.where(Ticket.status == status)
    if priority:
        count_query = count_query.where(Ticket.priority == priority)

    total_result = await session.execute(count_query)
    total = total_result.scalar()

    # Calculate SLA for each ticket
    sla_service = SLAService()
    tickets_with_sla = []

    for ticket in tickets:
        sla_info = await sla_service.calculate_sla_for_ticket(
            ticket.priority,
            ticket.created_at
        )

        tickets_with_sla.append({
            "id": str(ticket.id),
            "ticket_number": ticket.ticket_number,
            "title": ticket.title,
            "priority": ticket.priority.value,
            "status": ticket.status.value,
            "created_at": ticket.created_at.isoformat(),
            "sla": {
                "hours_remaining": sla_info["hours_remaining"],
                "is_breached": sla_info["is_breached"],
                "is_warning": sla_info["is_warning"],
            }
        })

    return {
        "tickets": tickets_with_sla,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    tenant_id: TenantId,
    session: AsyncSession = Depends(get_session),
):
    """Get ticket by ID (tenant-scoped)"""
    result = await session.execute(
        select(Ticket).where(
            Ticket.id == UUID(ticket_id),
            Ticket.tenant_id == tenant_id
        )
    )
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    sla_service = SLAService()
    sla_info = await sla_service.calculate_sla_for_ticket(
        ticket.priority,
        ticket.created_at
    )

    return {
        "id": str(ticket.id),
        "ticket_number": ticket.ticket_number,
        "title": ticket.title,
        "description": ticket.description,
        "priority": ticket.priority.value,
        "status": ticket.status.value,
        "created_at": ticket.created_at.isoformat(),
        "sla": sla_info,
    }

"""Test SLA service"""
import pytest
from datetime import datetime, timedelta
from app.services.sla_service import SLAService, SimpleSLAStrategy
from app.models.ticket import TicketPriority


@pytest.mark.asyncio
async def test_simple_sla_strategy_urgent():
    """Test SLA calculation for urgent priority"""
    sla_service = SLAService(SimpleSLAStrategy())
    created_at = datetime.utcnow()

    result = await sla_service.calculate_sla_for_ticket(
        TicketPriority.URGENT,
        created_at
    )

    # Urgent = 4 hours
    expected_due = created_at + timedelta(hours=4)
    assert result["resolution_due_at"].replace(microsecond=0) == expected_due.replace(microsecond=0)
    assert result["hours_remaining"] <= 4
    assert result["is_breached"] is False


@pytest.mark.asyncio
async def test_simple_sla_strategy_high():
    """Test SLA calculation for high priority"""
    sla_service = SLAService(SimpleSLAStrategy())
    created_at = datetime.utcnow()

    result = await sla_service.calculate_sla_for_ticket(
        TicketPriority.HIGH,
        created_at
    )

    # High = 24 hours
    expected_due = created_at + timedelta(hours=24)
    assert result["resolution_due_at"].replace(microsecond=0) == expected_due.replace(microsecond=0)
    assert result["hours_remaining"] <= 24


@pytest.mark.asyncio
async def test_sla_breached():
    """Test SLA breach detection"""
    sla_service = SLAService(SimpleSLAStrategy())
    # Created 5 hours ago
    created_at = datetime.utcnow() - timedelta(hours=5)

    result = await sla_service.calculate_sla_for_ticket(
        TicketPriority.URGENT,  # 4 hours
        created_at
    )

    assert result["is_breached"] is True
    assert result["hours_remaining"] < 0


@pytest.mark.asyncio
async def test_sla_warning():
    """Test SLA warning state"""
    sla_service = SLAService(SimpleSLAStrategy())
    # Created 3.5 hours ago (urgent = 4h, warning at 75% = 3h)
    created_at = datetime.utcnow() - timedelta(hours=3.5)

    result = await sla_service.calculate_sla_for_ticket(
        TicketPriority.URGENT,
        created_at
    )

    assert result["is_warning"] is True
    assert result["is_breached"] is False


@pytest.mark.asyncio
async def test_all_priorities():
    """Test SLA calculation for all priorities"""
    sla_service = SLAService(SimpleSLAStrategy())
    created_at = datetime.utcnow()

    priorities = [
        (TicketPriority.LOW, 72),
        (TicketPriority.MEDIUM, 48),
        (TicketPriority.HIGH, 24),
        (TicketPriority.URGENT, 4),
    ]

    for priority, expected_hours in priorities:
        result = await sla_service.calculate_sla_for_ticket(priority, created_at)
        assert result["hours_remaining"] <= expected_hours

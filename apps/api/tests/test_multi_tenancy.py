"""
Tests for multi-tenancy isolation and tenant-scoped data access.

These tests ensure that:
1. Data is properly isolated between tenants
2. Users can only access data from their own tenant
3. Cross-tenant data leakage is prevented
4. Tenant-scoped queries work correctly
"""
import pytest
from uuid import uuid4
from datetime import datetime
from sqlalchemy import select
from app.models.tenant import Tenant
from app.models.user import User, Role
from app.models.contact import Contact
from app.models.conversation import Conversation, Channel, ConversationStatus
from app.models.message import Message, MessageDirection, MessageStatus
from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.db.repositories.tenant import TenantRepository
from app.db.repositories.user import UserRepository
from app.core.security import hash_password


@pytest.mark.asyncio
async def test_tenant_creation(async_session):
    """Test creating tenants"""
    tenant_repo = TenantRepository(async_session)

    tenant1 = await tenant_repo.create(name="Test Company 1", slug="test1")
    tenant2 = await tenant_repo.create(name="Test Company 2", slug="test2")

    assert tenant1.id != tenant2.id
    assert tenant1.slug == "test1"
    assert tenant2.slug == "test2"
    assert tenant1.is_active is True


@pytest.mark.asyncio
async def test_user_isolation_by_tenant(async_session):
    """Test that users are isolated by tenant"""
    tenant_repo = TenantRepository(async_session)
    user_repo = UserRepository(async_session)

    # Create two tenants
    tenant1 = await tenant_repo.create(name="Company A", slug="company-a")
    tenant2 = await tenant_repo.create(name="Company B", slug="company-b")

    # Create users in each tenant with same email
    user1 = await user_repo.create(
        tenant_id=tenant1.id,
        name="John Doe",
        email="john@example.com",
        password_hash=hash_password("password123"),
        role=Role.AGENT
    )

    user2 = await user_repo.create(
        tenant_id=tenant2.id,
        name="John Doe",
        email="john@example.com",  # Same email, different tenant
        password_hash=hash_password("password123"),
        role=Role.AGENT
    )

    # Users should have different IDs
    assert user1.id != user2.id
    assert user1.tenant_id == tenant1.id
    assert user2.tenant_id == tenant2.id

    # Fetching by email should return only tenant-specific user
    fetched1 = await user_repo.get_by_email("john@example.com", tenant1.id)
    fetched2 = await user_repo.get_by_email("john@example.com", tenant2.id)

    assert fetched1.id == user1.id
    assert fetched2.id == user2.id
    assert fetched1.id != fetched2.id


@pytest.mark.asyncio
async def test_conversation_isolation(async_session):
    """Test that conversations are isolated by tenant"""
    tenant_repo = TenantRepository(async_session)

    # Create two tenants
    tenant1 = await tenant_repo.create(name="Tenant 1", slug="tenant1")
    tenant2 = await tenant_repo.create(name="Tenant 2", slug="tenant2")

    # Create contacts for each tenant
    contact1 = Contact(
        id=uuid4(),
        tenant_id=tenant1.id,
        name="Contact 1",
        phone="+5511999998888",
        metadata_={}
    )
    contact2 = Contact(
        id=uuid4(),
        tenant_id=tenant2.id,
        name="Contact 2",
        phone="+5511999997777",
        metadata_={}
    )
    async_session.add(contact1)
    async_session.add(contact2)
    await async_session.commit()

    # Create conversations for each tenant
    conv1 = Conversation(
        id=uuid4(),
        tenant_id=tenant1.id,
        contact_id=contact1.id,
        channel=Channel.WHATSAPP,
        status=ConversationStatus.OPEN,
        external_id="ext_1",
        unread_count=0,
        last_message_at=datetime.utcnow()
    )
    conv2 = Conversation(
        id=uuid4(),
        tenant_id=tenant2.id,
        contact_id=contact2.id,
        channel=Channel.EMAIL,
        status=ConversationStatus.OPEN,
        external_id="ext_2",
        unread_count=0,
        last_message_at=datetime.utcnow()
    )
    async_session.add(conv1)
    async_session.add(conv2)
    await async_session.commit()

    # Query conversations for tenant 1
    result1 = await async_session.execute(
        select(Conversation).where(Conversation.tenant_id == tenant1.id)
    )
    tenant1_conversations = list(result1.scalars().all())

    # Query conversations for tenant 2
    result2 = await async_session.execute(
        select(Conversation).where(Conversation.tenant_id == tenant2.id)
    )
    tenant2_conversations = list(result2.scalars().all())

    # Each tenant should only see their own conversation
    assert len(tenant1_conversations) == 1
    assert len(tenant2_conversations) == 1
    assert tenant1_conversations[0].id == conv1.id
    assert tenant2_conversations[0].id == conv2.id


@pytest.mark.asyncio
async def test_ticket_number_unique_per_tenant(async_session):
    """Test that ticket numbers are unique per tenant, but can be reused across tenants"""
    tenant_repo = TenantRepository(async_session)

    # Create two tenants
    tenant1 = await tenant_repo.create(name="Tenant A", slug="tenant-a")
    tenant2 = await tenant_repo.create(name="Tenant B", slug="tenant-b")

    # Create contacts for conversations
    contact1 = Contact(id=uuid4(), tenant_id=tenant1.id, name="C1", metadata_={})
    contact2 = Contact(id=uuid4(), tenant_id=tenant2.id, name="C2", metadata_={})
    async_session.add_all([contact1, contact2])
    await async_session.commit()

    # Create conversations
    conv1 = Conversation(
        id=uuid4(),
        tenant_id=tenant1.id,
        contact_id=contact1.id,
        channel=Channel.WHATSAPP,
        status=ConversationStatus.OPEN,
        external_id="ext_a1",
        unread_count=0,
        last_message_at=datetime.utcnow()
    )
    conv2 = Conversation(
        id=uuid4(),
        tenant_id=tenant2.id,
        contact_id=contact2.id,
        channel=Channel.WHATSAPP,
        status=ConversationStatus.OPEN,
        external_id="ext_b1",
        unread_count=0,
        last_message_at=datetime.utcnow()
    )
    async_session.add_all([conv1, conv2])
    await async_session.commit()

    # Create tickets with same ticket number in different tenants
    ticket1 = Ticket(
        id=uuid4(),
        tenant_id=tenant1.id,
        ticket_number="TICKET-1000",
        conversation_id=conv1.id,
        title="Issue 1",
        priority=TicketPriority.HIGH,
        status=TicketStatus.OPEN
    )
    ticket2 = Ticket(
        id=uuid4(),
        tenant_id=tenant2.id,
        ticket_number="TICKET-1000",  # Same number, different tenant
        conversation_id=conv2.id,
        title="Issue 2",
        priority=TicketPriority.LOW,
        status=TicketStatus.OPEN
    )
    async_session.add_all([ticket1, ticket2])
    await async_session.commit()

    # Both tickets should exist
    result1 = await async_session.execute(
        select(Ticket).where(
            Ticket.tenant_id == tenant1.id,
            Ticket.ticket_number == "TICKET-1000"
        )
    )
    result2 = await async_session.execute(
        select(Ticket).where(
            Ticket.tenant_id == tenant2.id,
            Ticket.ticket_number == "TICKET-1000"
        )
    )

    t1 = result1.scalar_one_or_none()
    t2 = result2.scalar_one_or_none()

    assert t1 is not None
    assert t2 is not None
    assert t1.id != t2.id
    assert t1.title == "Issue 1"
    assert t2.title == "Issue 2"


@pytest.mark.asyncio
async def test_message_isolation(async_session):
    """Test that messages are isolated by tenant"""
    tenant_repo = TenantRepository(async_session)

    tenant1 = await tenant_repo.create(name="T1", slug="t1")
    tenant2 = await tenant_repo.create(name="T2", slug="t2")

    # Setup data for both tenants
    contact1 = Contact(id=uuid4(), tenant_id=tenant1.id, name="C1", metadata_={})
    contact2 = Contact(id=uuid4(), tenant_id=tenant2.id, name="C2", metadata_={})
    async_session.add_all([contact1, contact2])
    await async_session.commit()

    conv1 = Conversation(
        id=uuid4(), tenant_id=tenant1.id, contact_id=contact1.id,
        channel=Channel.WHATSAPP, status=ConversationStatus.OPEN,
        external_id="c1", unread_count=0, last_message_at=datetime.utcnow()
    )
    conv2 = Conversation(
        id=uuid4(), tenant_id=tenant2.id, contact_id=contact2.id,
        channel=Channel.WHATSAPP, status=ConversationStatus.OPEN,
        external_id="c2", unread_count=0, last_message_at=datetime.utcnow()
    )
    async_session.add_all([conv1, conv2])
    await async_session.commit()

    # Create messages
    msg1 = Message(
        id=uuid4(),
        tenant_id=tenant1.id,
        conversation_id=conv1.id,
        direction=MessageDirection.INBOUND,
        status=MessageStatus.DELIVERED,
        body="Message from tenant 1",
        provider_message_id="msg1",
        is_read=False,
        metadata_={}
    )
    msg2 = Message(
        id=uuid4(),
        tenant_id=tenant2.id,
        conversation_id=conv2.id,
        direction=MessageDirection.INBOUND,
        status=MessageStatus.DELIVERED,
        body="Message from tenant 2",
        provider_message_id="msg2",
        is_read=False,
        metadata_={}
    )
    async_session.add_all([msg1, msg2])
    await async_session.commit()

    # Query messages per tenant
    result1 = await async_session.execute(
        select(Message).where(Message.tenant_id == tenant1.id)
    )
    result2 = await async_session.execute(
        select(Message).where(Message.tenant_id == tenant2.id)
    )

    messages1 = list(result1.scalars().all())
    messages2 = list(result2.scalars().all())

    assert len(messages1) == 1
    assert len(messages2) == 1
    assert messages1[0].body == "Message from tenant 1"
    assert messages2[0].body == "Message from tenant 2"


@pytest.mark.asyncio
async def test_cross_tenant_data_access_prevented(async_session):
    """Test that accessing another tenant's data returns nothing"""
    tenant_repo = TenantRepository(async_session)
    user_repo = UserRepository(async_session)

    tenant1 = await tenant_repo.create(name="Tenant 1", slug="t1")
    tenant2 = await tenant_repo.create(name="Tenant 2", slug="t2")

    # Create user in tenant 1
    user_t1 = await user_repo.create(
        tenant_id=tenant1.id,
        name="User T1",
        email="user@t1.com",
        password_hash=hash_password("pass"),
        role=Role.AGENT
    )

    # Try to fetch tenant1's user using tenant2's ID (should return None)
    result = await user_repo.get(user_t1.id, tenant2.id)

    assert result is None  # Should not find the user


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

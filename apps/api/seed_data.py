"""
Seed data script para popular banco com dados de teste (com multi-tenancy)
"""
import asyncio
from datetime import datetime, timedelta
from uuid import uuid4, UUID
from app.db.database import DatabaseSessionFactory
from app.db.repositories.user import UserRepository
from app.db.repositories.tenant import TenantRepository
from app.core.security import hash_password
from app.models.user import Role
from app.models.contact import Contact
from app.models.conversation import Conversation, Channel, ConversationStatus
from app.models.message import Message, MessageDirection, MessageStatus
from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.services.sla_service import SLAService


async def seed_tenants(session):
    """Criar tenants de teste"""
    print("📝 Criando tenants...")
    tenant_repo = TenantRepository(session)

    tenants_data = [
        {"name": "Acme Corporation", "slug": "acme"},
        {"name": "TechStart Inc", "slug": "techstart"},
    ]

    created_tenants = []
    for tenant_data in tenants_data:
        existing = await tenant_repo.get_by_slug(tenant_data["slug"])
        if existing:
            print(f"  ✅ Tenant {tenant_data['slug']} já existe")
            created_tenants.append(existing)
        else:
            tenant = await tenant_repo.create(
                name=tenant_data["name"],
                slug=tenant_data["slug"],
                is_active=True,
            )
            print(f"  ✅ Tenant criado: {tenant.name} ({tenant.slug})")
            created_tenants.append(tenant)

    return created_tenants


async def seed_users(session, tenant_id: UUID, tenant_name: str):
    """Criar usuários de teste para um tenant"""
    print(f"📝 Criando usuários para {tenant_name}...")
    user_repo = UserRepository(session)

    # Adaptar email ao tenant para evitar duplicados
    tenant_suffix = tenant_name.lower().replace(" ", "")

    users_data = [
        {
            "name": f"Admin {tenant_name}",
            "email": f"admin@{tenant_suffix}.com",
            "password": "admin123",
            "role": Role.ADMIN,
        },
        {
            "name": f"João Silva - {tenant_name}",
            "email": f"joao@{tenant_suffix}.com",
            "password": "agent123",
            "role": Role.AGENT,
        },
        {
            "name": f"Maria Santos - {tenant_name}",
            "email": f"maria@{tenant_suffix}.com",
            "password": "agent123",
            "role": Role.AGENT,
        },
    ]

    created_users = []
    for user_data in users_data:
        existing = await user_repo.get_by_email(user_data["email"], tenant_id)
        if existing:
            print(f"  ✅ User {user_data['email']} já existe")
            created_users.append(existing)
        else:
            user = await user_repo.create(
                tenant_id=tenant_id,
                name=user_data["name"],
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role=user_data["role"],
            )
            print(f"  ✅ User criado: {user.email}")
            created_users.append(user)

    return created_users


async def seed_contacts(session, tenant_id: UUID, tenant_name: str):
    """Criar contatos de teste para um tenant"""
    print(f"📝 Criando contatos para {tenant_name}...")

    contacts_data = [
        {"name": "Cliente WhatsApp 1", "phone": "+5511999998888"},
        {"name": "Cliente Email 1", "email": "cliente1@example.com"},
        {"name": "Cliente WhatsApp 2", "phone": "+5511999997777"},
    ]

    created_contacts = []
    for contact_data in contacts_data:
        contact = Contact(
            id=uuid4(),
            tenant_id=tenant_id,
            name=f"{contact_data['name']} - {tenant_name}",
            phone=contact_data.get("phone"),
            email=contact_data.get("email"),
            metadata_={},
        )
        session.add(contact)
        created_contacts.append(contact)
        print(f"  ✅ Contact criado: {contact.name}")

    await session.commit()
    return created_contacts


async def seed_conversations(session, tenant_id: UUID, contacts, agents):
    """Criar conversas de teste para um tenant"""
    print(f"📝 Criando conversas...")

    conversations_data = [
        {
            "contact": contacts[0],
            "agent": agents[0],
            "channel": Channel.WHATSAPP,
            "status": ConversationStatus.IN_PROGRESS,
        },
        {
            "contact": contacts[1],
            "agent": agents[1],
            "channel": Channel.EMAIL,
            "status": ConversationStatus.OPEN,
        },
        {
            "contact": contacts[2],
            "agent": None,
            "channel": Channel.WHATSAPP,
            "status": ConversationStatus.OPEN,
        },
    ]

    created_conversations = []
    for conv_data in conversations_data:
        conversation = Conversation(
            id=uuid4(),
            tenant_id=tenant_id,
            contact_id=conv_data["contact"].id,
            assigned_agent_id=conv_data["agent"].id if conv_data["agent"] else None,
            channel=conv_data["channel"],
            status=conv_data["status"],
            external_id=f"ext_{uuid4().hex[:8]}",
            unread_count=0,
            last_message_at=datetime.utcnow(),
        )
        session.add(conversation)
        created_conversations.append(conversation)
        print(f"  ✅ Conversation criada: {conversation.channel.value}")

    await session.commit()
    return created_conversations


async def seed_messages(session, tenant_id: UUID, conversations):
    """Criar mensagens de teste para um tenant"""
    print(f"📝 Criando mensagens...")

    messages_data = [
        {
            "conversation": conversations[0],
            "direction": MessageDirection.INBOUND,
            "body": "Olá, preciso de ajuda com meu pedido",
        },
        {
            "conversation": conversations[0],
            "direction": MessageDirection.OUTBOUND,
            "body": "Olá! Como posso ajudar?",
        },
        {
            "conversation": conversations[1],
            "direction": MessageDirection.INBOUND,
            "body": "Meu login não está funcionando",
        },
    ]

    for msg_data in messages_data:
        message = Message(
            id=uuid4(),
            tenant_id=tenant_id,
            conversation_id=msg_data["conversation"].id,
            sender_user_id=None,
            direction=msg_data["direction"],
            status=MessageStatus.DELIVERED,
            body=msg_data["body"],
            provider_message_id=f"msg_{uuid4().hex[:12]}",
            is_read=False,
            metadata_={},
        )
        session.add(message)
        print(f"  ✅ Message criada: {msg_data['direction'].value}")

    await session.commit()


async def seed_tickets(session, tenant_id: UUID, conversations, agents, tenant_slug: str):
    """Criar tickets de teste para um tenant"""
    print(f"📝 Criando tickets...")

    sla_service = SLAService()

    tickets_data = [
        {
            "title": "Sistema fora do ar",
            "description": "Clientes não conseguem acessar o sistema",
            "priority": TicketPriority.URGENT,
            "status": TicketStatus.OPEN,
            "conversation": conversations[0],
            "assignee": None,
        },
        {
            "title": "Erro no login",
            "description": "Credenciais não estão sendo aceitas",
            "priority": TicketPriority.HIGH,
            "status": TicketStatus.IN_PROGRESS,
            "conversation": conversations[1],
            "assignee": agents[1],
        },
        {
            "title": "Dúvida sobre planos",
            "description": "Cliente quer saber diferença entre planos",
            "priority": TicketPriority.LOW,
            "status": TicketStatus.OPEN,
            "conversation": conversations[2],
            "assignee": agents[0],
        },
    ]

    for idx, ticket_data in enumerate(tickets_data):
        created_at = datetime.utcnow() - timedelta(hours=idx * 2)
        sla_info = await sla_service.calculate_sla_for_ticket(
            ticket_data["priority"],
            created_at
        )

        ticket = Ticket(
            id=uuid4(),
            tenant_id=tenant_id,
            ticket_number=f"{tenant_slug.upper()}-{1000 + idx}",
            conversation_id=ticket_data["conversation"].id,
            assignee_id=ticket_data["assignee"].id if ticket_data["assignee"] else None,
            title=ticket_data["title"],
            description=ticket_data["description"],
            priority=ticket_data["priority"],
            status=ticket_data["status"],
            resolution_due_at=sla_info["resolution_due_at"],
            created_at=created_at,
        )
        session.add(ticket)
        print(f"  ✅ Ticket criado: {ticket.ticket_number} - {ticket.title}")

    await session.commit()


async def seed_tenant_data(session, tenant):
    """Seed completo para um tenant"""
    print(f"\n{'='*60}")
    print(f"🏢 Populando dados para tenant: {tenant.name}")
    print(f"{'='*60}\n")

    users = await seed_users(session, tenant.id, tenant.name)
    agents = [u for u in users if u.role != Role.ADMIN]

    contacts = await seed_contacts(session, tenant.id, tenant.name)
    conversations = await seed_conversations(session, tenant.id, contacts, agents)
    await seed_messages(session, tenant.id, conversations)
    await seed_tickets(session, tenant.id, conversations, agents, tenant.slug)

    print(f"\n✅ Seed completo para {tenant.name}!")
    print(f"📊 Resumo:")
    print(f"  - {len(users)} usuários")
    print(f"  - {len(contacts)} contatos")
    print(f"  - {len(conversations)} conversas")
    print(f"  - 3 mensagens")
    print(f"  - 3 tickets")
    print(f"\n🔑 Credenciais para {tenant.name}:")
    for user in users:
        role_name = user.role.value.capitalize()
        print(f"  - {user.email} / admin123 ou agent123 ({role_name})")


async def main():
    """Executar seed completo com multi-tenancy"""
    print("🌱 Iniciando seed do banco de dados com Multi-Tenancy...\n")

    DatabaseSessionFactory.initialize()
    factory = DatabaseSessionFactory.get_session_factory()

    async with factory() as session:
        # Criar tenants
        tenants = await seed_tenants(session)

        # Criar dados para cada tenant
        for tenant in tenants:
            await seed_tenant_data(session, tenant)

    print("\n" + "="*60)
    print("✅ Seed completo para todos os tenants!")
    print("="*60)
    print(f"\n🏢 Total de tenants: {len(tenants)}")
    for tenant in tenants:
        print(f"  - {tenant.name} (slug: {tenant.slug})")


if __name__ == "__main__":
    asyncio.run(main())

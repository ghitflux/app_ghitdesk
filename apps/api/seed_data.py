"""
Seed data script para popular banco com dados de teste
"""
import asyncio
from datetime import datetime, timedelta
from uuid import uuid4
from app.db.database import DatabaseSessionFactory
from app.db.repositories.user import UserRepository
from app.core.security import hash_password
from app.models.user import Role, User
from app.models.contact import Contact
from app.models.conversation import Conversation, Channel, ConversationStatus
from app.models.message import Message, MessageDirection, MessageStatus
from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.services.sla_service import SLAService


async def seed_users(session):
    """Criar usuários de teste"""
    print("📝 Criando usuários...")
    user_repo = UserRepository(session)

    users_data = [
        {
            "name": "Admin",
            "email": "admin@ghitdesk.com",
            "password": "admin123",
            "role": Role.ADMIN,
        },
        {
            "name": "João Silva",
            "email": "joao@ghitdesk.com",
            "password": "agent123",
            "role": Role.AGENT,
        },
        {
            "name": "Maria Santos",
            "email": "maria@ghitdesk.com",
            "password": "agent123",
            "role": Role.AGENT,
        },
    ]

    created_users = []
    for user_data in users_data:
        existing = await user_repo.get_by_email(user_data["email"])
        if existing:
            print(f"  ✅ User {user_data['email']} já existe")
            created_users.append(existing)
        else:
            user = await user_repo.create(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role=user_data["role"],
            )
            print(f"  ✅ User criado: {user.email}")
            created_users.append(user)

    return created_users


async def seed_contacts(session):
    """Criar contatos de teste"""
    print("📝 Criando contatos...")

    contacts_data = [
        {"name": "Cliente WhatsApp 1", "phone": "+5511999998888"},
        {"name": "Cliente Email 1", "email": "cliente1@example.com"},
        {"name": "Cliente WhatsApp 2", "phone": "+5511999997777"},
    ]

    created_contacts = []
    for contact_data in contacts_data:
        contact = Contact(
            id=uuid4(),
            name=contact_data["name"],
            phone=contact_data.get("phone"),
            email=contact_data.get("email"),
            metadata_={},
        )
        session.add(contact)
        created_contacts.append(contact)
        print(f"  ✅ Contact criado: {contact.name}")

    await session.commit()
    return created_contacts


async def seed_conversations(session, contacts, agents):
    """Criar conversas de teste"""
    print("📝 Criando conversas...")

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


async def seed_messages(session, conversations):
    """Criar mensagens de teste"""
    print("📝 Criando mensagens...")

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


async def seed_tickets(session, conversations, agents):
    """Criar tickets de teste"""
    print("📝 Criando tickets...")

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
            ticket_number=f"TICKET-{1000 + idx}",
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


async def main():
    """Executar seed completo"""
    print("🌱 Iniciando seed do banco de dados...\n")

    DatabaseSessionFactory.initialize()
    factory = DatabaseSessionFactory.get_session_factory()

    async with factory() as session:
        # Criar dados em ordem
        users = await seed_users(session)
        agents = [u for u in users if u.role != Role.ADMIN]

        contacts = await seed_contacts(session)
        conversations = await seed_conversations(session, contacts, agents)
        await seed_messages(session, conversations)
        await seed_tickets(session, conversations, agents)

    print("\n✅ Seed completo!")
    print("\n📊 Resumo:")
    print(f"  - {len(users)} usuários")
    print(f"  - {len(contacts)} contatos")
    print(f"  - {len(conversations)} conversas")
    print(f"  - 3 mensagens")
    print(f"  - 3 tickets")
    print("\n🔑 Credenciais:")
    print("  - admin@ghitdesk.com / admin123 (Admin)")
    print("  - joao@ghitdesk.com / agent123 (Agent)")
    print("  - maria@ghitdesk.com / agent123 (Agent)")


if __name__ == "__main__":
    asyncio.run(main())

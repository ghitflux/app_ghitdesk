# 🛠️ Guia de Implementação - Correções Restantes

**Data:** 2025-11-13
**Status:** 7/52 correções implementadas (13%)
**Prioridade:** Implementar restante em 2-3 sprints

---

## ✅ COMPLETO - Correções de Segurança Críticas (Commit: 8d92083)

1. ✅ Autenticação em todos endpoints
2. ✅ Endpoint /auth/refresh implementado
3. ✅ Cookies seguros via environment variables
4. ✅ Secrets movidos para .env
5. ✅ Webhook token de environment variable
6. ✅ Error handling melhorado
7. ✅ Endpoint /auth/me implementado

---

## 🔴 PRÓXIMO - Correções Críticas Restantes (5 itens)

### 8. Fix Message Deduplication Race Condition

**Problema:**
Verificação de duplicata não é atômica - mensagens podem ser processadas 2x.

**Arquivo:** `apps/api/app/services/message_service.py` (linha 38-47)

**Implementação:**

```python
# apps/api/app/services/message_service.py

async def process(
    self,
    message_data: dict,
    session: AsyncSession,
) -> dict:
    from app.utils.events import broadcast_new_message, broadcast_conversation_update

    # 1. Atomic deduplication with Redis SET NX
    redis = await RedisClient.get_instance()
    message_id = message_data.get("message_id", "")
    dedup_key = f"message:{message_id}"

    # ✅ Use SET with NX (not exists) - atomic operation
    is_new = await redis.set(
        dedup_key,
        "1",
        ex=86400,  # TTL 24 hours
        nx=True    # Only set if NOT exists (atomic!)
    )

    if not is_new:
        raise ValueError("Message already processed")

    # Continue with message processing...
    phone = message_data.get("from", "unknown")
    conversation_id = f"whatsapp_{phone}"

    # Broadcast SSE events...
    await broadcast_new_message(
        conversation_id=conversation_id,
        message={
            "id": message_id,
            "text": message_data.get("text", ""),
            "from_customer": True,
            "channel": "whatsapp",
            "from": phone,
        }
    )

    await broadcast_conversation_update(
        conversation_id=conversation_id,
        changes={
            "last_message_at": message_data.get("timestamp"),
            "unread_count": 1,
        }
    )

    return {
        "status": "processed",
        "message_id": message_id,
        "conversation_id": conversation_id,
    }
```

**Estimativa:** 2 horas
**Prioridade:** 🔴 CRÍTICA

---

### 9. Fix SSE Memory Leak

**Problema:**
Clientes desconectados nunca são removidos da memória.

**Arquivo:** `apps/api/app/integrations/sse_manager.py` (linhas 70-86)

**Implementação:**

```python
# apps/api/app/integrations/sse_manager.py

import time
import logging

logger = logging.getLogger(__name__)

async def subscribe(self, client_id: str) -> AsyncGenerator[str, None]:
    """Subscribe client to SSE stream with timeout cleanup"""
    queue = asyncio.Queue()
    self._subscribers[client_id] = queue
    last_activity = time.time()

    logger.info(f"Client {client_id} connected. Total clients: {len(self._subscribers)}")

    try:
        while True:
            try:
                # ✅ Wait for message with 60s timeout
                message = await asyncio.wait_for(queue.get(), timeout=60.0)
                last_activity = time.time()
                yield f"data: {json.dumps(message)}\n\n"

            except asyncio.TimeoutError:
                # ✅ Send heartbeat to keep connection alive
                current_time = time.time()

                # If no activity for 5 minutes, disconnect
                if current_time - last_activity > 300:
                    logger.warning(
                        f"Client {client_id} timeout after 5min inactivity. "
                        f"Closing connection."
                    )
                    break

                # Send heartbeat comment (keeps connection alive)
                yield ": heartbeat\n\n"
                last_activity = current_time

    except asyncio.CancelledError:
        logger.info(f"Client {client_id} connection cancelled")

    except Exception as e:
        logger.error(f"Client {client_id} error: {e}", exc_info=True)

    finally:
        # ✅ Always cleanup
        if client_id in self._subscribers:
            del self._subscribers[client_id]

        logger.info(
            f"Client {client_id} disconnected. "
            f"Remaining clients: {len(self._subscribers)}"
        )
```

**Estimativa:** 3 horas
**Prioridade:** 🔴 CRÍTICA

---

### 10. Fix Unread Count Race Condition

**Problema:**
Contador de não lidas apenas em memória, nunca persiste no banco.

**Arquivo:** `apps/api/app/models/conversation.py`

**Solução 1 - Atomic SQL Update:**

```python
# Quando receber nova mensagem:
from sqlalchemy import update

async def increment_unread_count(
    conversation_id: UUID,
    session: AsyncSession
) -> None:
    """Atomically increment unread count"""
    stmt = (
        update(Conversation)
        .where(Conversation.id == conversation_id)
        .values(unread_count=Conversation.unread_count + 1)
        .execution_options(synchronize_session=False)
    )
    await session.execute(stmt)
    await session.commit()
```

**Solução 2 - Calculate Dynamically (Recommended):**

```python
# Remove campo unread_count do modelo
# Sempre calcula via query:

from sqlalchemy import select, func
from app.models.message import Message

async def get_unread_count(
    conversation_id: UUID,
    session: AsyncSession
) -> int:
    """Calculate unread count from messages"""
    result = await session.execute(
        select(func.count(Message.id))
        .where(
            Message.conversation_id == conversation_id,
            Message.is_read == False,
            Message.direction == "inbound"
        )
    )
    return result.scalar() or 0

# Usar em API responses:
conversation_data = {
    "id": str(conv.id),
    "channel": conv.channel.value,
    "status": conv.status.value,
    "unread_count": await get_unread_count(conv.id, session),
    "last_message_at": conv.last_message_at.isoformat(),
}
```

**Estimativa:** 4 horas
**Prioridade:** 🔴 CRÍTICA

---

### 11. Add Database Connection Pooling

**Problema:**
NullPool cria nova conexão a cada request (10-100x mais lento).

**Arquivo:** `apps/api/app/db/database.py` (linha 49)

**Implementação:**

```python
# apps/api/app/db/database.py

from sqlalchemy.pool import QueuePool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# ANTES (RUIM):
# engine = create_async_engine(
#     settings.DATABASE_URL,
#     echo=settings.DEBUG,
#     poolclass=NullPool,  # ❌ Performance péssima
# )

# DEPOIS (BOM):
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,

    # ✅ Connection pooling
    poolclass=QueuePool,
    pool_size=20,           # 20 conexões permanentes
    max_overflow=10,        # +10 conexões temporárias (pico de 30)
    pool_timeout=30,        # Timeout de 30s para pegar conexão
    pool_recycle=3600,      # Recicla conexões a cada 1 hora
    pool_pre_ping=True,     # Testa conexão antes de usar

    # ✅ Connection settings
    connect_args={
        "server_settings": {
            "application_name": "ghitdesk_api",
            "jit": "off",  # Desabilitar JIT para melhor performance
        }
    },

    # ✅ Statement cache
    query_cache_size=1200,  # Cache de queries preparadas
)

# Session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # ✅ Permite acessar objetos após commit
    autoflush=False,         # ✅ Controle manual de flush
)
```

**Config Recomendada por Ambiente:**

```python
# Development:
pool_size=5
max_overflow=5

# Staging:
pool_size=10
max_overflow=10

# Production:
pool_size=20
max_overflow=10
```

**Estimativa:** 2 horas
**Prioridade:** 🔴 CRÍTICA (Performance)

---

### 12. Create Missing Repository Classes

**Problema:**
Queries SQL espalhadas, código duplicado, difícil testar.

**Implementação:**

**TicketRepository:**

```python
# apps/api/app/db/repositories/ticket_repository.py

from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from sqlalchemy.orm import joinedload
from uuid import UUID

from app.models.ticket import Ticket, TicketStatus, TicketPriority

class TicketRepository:
    """Repository for Ticket entity"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, ticket_id: UUID) -> Optional[Ticket]:
        """Get ticket by ID with relationships"""
        result = await self.session.execute(
            select(Ticket)
            .options(
                joinedload(Ticket.contact),
                joinedload(Ticket.assigned_to),
                joinedload(Ticket.conversation)
            )
            .where(Ticket.id == ticket_id)
        )
        return result.scalars().first()

    async def get_by_number(self, ticket_number: str) -> Optional[Ticket]:
        """Get ticket by ticket number"""
        result = await self.session.execute(
            select(Ticket).where(Ticket.ticket_number == ticket_number)
        )
        return result.scalars().first()

    async def list_tickets(
        self,
        status: Optional[TicketStatus] = None,
        priority: Optional[TicketPriority] = None,
        assigned_to_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Ticket], int]:
        """List tickets with filters and return total count"""

        # Build base query
        query = select(Ticket).options(
            joinedload(Ticket.contact),
            joinedload(Ticket.assigned_to),
        )

        # Apply filters
        if status:
            query = query.where(Ticket.status == status)
        if priority:
            query = query.where(Ticket.priority == priority)
        if assigned_to_id:
            query = query.where(Ticket.assigned_to_id == assigned_to_id)

        # Count total (before pagination)
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and ordering
        query = (
            query
            .order_by(Ticket.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        # Execute query
        result = await self.session.execute(query)
        tickets = result.unique().scalars().all()

        return list(tickets), total

    async def create(self, ticket_data: dict) -> Ticket:
        """Create new ticket"""
        ticket = Ticket(**ticket_data)
        self.session.add(ticket)
        await self.session.flush()  # Get ID without committing
        await self.session.refresh(ticket)
        return ticket

    async def update(
        self,
        ticket_id: UUID,
        updates: dict
    ) -> Optional[Ticket]:
        """Update ticket"""
        ticket = await self.get_by_id(ticket_id)
        if not ticket:
            return None

        for key, value in updates.items():
            if hasattr(ticket, key):
                setattr(ticket, key, value)

        await self.session.flush()
        await self.session.refresh(ticket)
        return ticket

    async def delete(self, ticket_id: UUID) -> bool:
        """Soft delete ticket"""
        ticket = await self.get_by_id(ticket_id)
        if not ticket:
            return False

        ticket.status = TicketStatus.CLOSED
        await self.session.flush()
        return True

    async def count_by_status(self) -> dict:
        """Count tickets by status"""
        result = await self.session.execute(
            select(
                Ticket.status,
                func.count(Ticket.id).label("count")
            )
            .group_by(Ticket.status)
        )

        counts = {status.value: 0 for status in TicketStatus}
        for row in result:
            counts[row.status.value] = row.count

        return counts

    async def get_overdue_tickets(self) -> List[Ticket]:
        """Get tickets with breached SLA"""
        # TODO: Implement SLA breach logic
        # This would require SLA deadline field in Ticket model
        pass
```

**ConversationRepository:**

```python
# apps/api/app/db/repositories/conversation_repository.py

from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload, selectinload
from uuid import UUID

from app.models.conversation import Conversation, ConversationStatus, Channel

class ConversationRepository:
    """Repository for Conversation entity"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, conversation_id: UUID) -> Optional[Conversation]:
        """Get conversation by ID with relationships"""
        result = await self.session.execute(
            select(Conversation)
            .options(
                joinedload(Conversation.contact),
                joinedload(Conversation.assigned_to),
                selectinload(Conversation.messages)
                    .selectinload(Message.sender)
            )
            .where(Conversation.id == conversation_id)
        )
        return result.unique().scalars().first()

    async def list_conversations(
        self,
        status: Optional[ConversationStatus] = None,
        channel: Optional[Channel] = None,
        assigned_to_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Conversation], int]:
        """List conversations with filters"""

        # Build query with eager loading
        query = select(Conversation).options(
            joinedload(Conversation.contact),
            joinedload(Conversation.assigned_to),
        )

        # Apply filters
        if status:
            query = query.where(Conversation.status == status)
        if channel:
            query = query.where(Conversation.channel == channel)
        if assigned_to_id:
            query = query.where(Conversation.assigned_to_id == assigned_to_id)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.session.scalar(count_query) or 0

        # Apply pagination
        query = (
            query
            .order_by(Conversation.last_message_at.desc())
            .offset(skip)
            .limit(limit)
        )

        # Execute
        result = await self.session.execute(query)
        conversations = result.unique().scalars().all()

        return list(conversations), total

    async def create(self, conversation_data: dict) -> Conversation:
        """Create new conversation"""
        conversation = Conversation(**conversation_data)
        self.session.add(conversation)
        await self.session.flush()
        await self.session.refresh(conversation)
        return conversation

    async def update(
        self,
        conversation_id: UUID,
        updates: dict
    ) -> Optional[Conversation]:
        """Update conversation"""
        conversation = await self.get_by_id(conversation_id)
        if not conversation:
            return None

        for key, value in updates.items():
            if hasattr(conversation, key):
                setattr(conversation, key, value)

        await self.session.flush()
        await self.session.refresh(conversation)
        return conversation

    async def get_unread_count(self, conversation_id: UUID) -> int:
        """Calculate unread messages count"""
        from app.models.message import Message

        result = await self.session.execute(
            select(func.count(Message.id))
            .where(
                Message.conversation_id == conversation_id,
                Message.is_read == False,
                Message.direction == "inbound"
            )
        )
        return result.scalar() or 0
```

**MessageRepository e ContactRepository seguiriam o mesmo padrão.**

**Usar nos Routes:**

```python
# apps/api/app/api/routes/tickets.py

from app.db.repositories.ticket_repository import TicketRepository

@router.get("/")
async def list_tickets(
    status: Optional[TicketStatus] = None,
    skip: int = 0,
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """List tickets"""
    repo = TicketRepository(session)
    tickets, total = await repo.list_tickets(
        status=status,
        skip=skip,
        limit=limit
    )

    # Calculate SLA...
    # Return response...
```

**Estimativa:** 12 horas (3h por repository)
**Prioridade:** 🔴 ALTA

---

## 🟠 ALTO - Correções de Performance e UX (12 itens)

### 13. Fix N+1 Query Problem

**Problema:**
50 conversas = 101 queries (1 lista + 50 contacts + 50 messages)

**Arquivo:** `apps/api/app/api/routes/conversations.py`

**Implementação:**

```python
from sqlalchemy.orm import selectinload, joinedload

@router.get("/")
async def list_conversations(...):
    # ✅ Eager loading
    query = (
        select(Conversation)
        .options(
            joinedload(Conversation.contact),      # JOIN
            joinedload(Conversation.assigned_to),  # JOIN
            selectinload(Conversation.messages)    # Batch load
                .selectinload(Message.sender)       # Nested batch
        )
    )

    if status:
        query = query.where(Conversation.status == status)

    result = await session.execute(query)
    conversations = result.unique().scalars().all()  # ✅ unique() importante!

    # Agora apenas 2-3 queries total!
```

**Estimativa:** 4 horas
**Prioridade:** 🟠 ALTA

---

### 14. Add Database Indexes

**Problema:**
Queries lentas em colunas não indexadas.

**Implementação:**

```python
# apps/api/app/models/message.py

class Message(Base):
    # ...existing fields...

    # ✅ Add indexes
    __table_args__ = (
        Index('ix_message_conversation_id', 'conversation_id'),
        Index('ix_message_direction', 'direction'),
        Index('ix_message_is_read', 'is_read'),
        Index('ix_message_created_at', 'created_at'),
        Index(
            'ix_message_unread',
            'conversation_id',
            'is_read',
            'direction',
            postgresql_where=text("is_read = false AND direction = 'inbound'")
        ),
    )

# apps/api/app/models/ticket.py

class Ticket(Base):
    # ...existing fields...

    __table_args__ = (
        Index('ix_ticket_status', 'status'),
        Index('ix_ticket_priority', 'priority'),
        Index('ix_ticket_assigned_to', 'assigned_to_id'),
        Index('ix_ticket_created_at', 'created_at'),
        Index(
            'ix_ticket_open_high_priority',
            'status',
            'priority',
            postgresql_where=text("status = 'open' AND priority IN ('high', 'urgent')")
        ),
    )
```

**Migration:**

```bash
cd apps/api
alembic revision -m "add indexes for performance"
```

```python
# alembic/versions/xxx_add_indexes.py

def upgrade():
    # Messages
    op.create_index('ix_message_direction', 'messages', ['direction'])
    op.create_index('ix_message_is_read', 'messages', ['is_read'])
    op.create_index(
        'ix_message_unread',
        'messages',
        ['conversation_id', 'is_read', 'direction'],
        postgresql_where="is_read = false AND direction = 'inbound'"
    )

    # Tickets
    op.create_index('ix_ticket_status', 'tickets', ['status'])
    op.create_index('ix_ticket_priority', 'tickets', ['priority'])

def downgrade():
    op.drop_index('ix_message_direction')
    op.drop_index('ix_message_is_read')
    op.drop_index('ix_message_unread')
    op.drop_index('ix_ticket_status')
    op.drop_index('ix_ticket_priority')
```

**Estimativa:** 3 horas
**Prioridade:** 🟠 ALTA

---

### 15-26. Outras Correções ALTAS

*(Continuaria com as outras correções de alta prioridade...)*

---

## 🟡 MÉDIO - Melhorias de Qualidade (20 itens)

*(Lista completa de 20 correções médias...)*

---

## 📊 Resumo de Estimativas

| Prioridade | Itens | Horas Estimadas |
|-----------|-------|-----------------|
| ✅ Completo | 7 | ~25h |
| 🔴 Crítico | 5 | 25h |
| 🟠 Alto | 12 | 45h |
| 🟡 Médio | 20 | 40h |
| 🟢 Baixo | 8 | 15h |
| **TOTAL** | **52** | **150h** |

---

## 🎯 Roadmap Sugerido

### Sprint 1 (2 semanas) - CRÍTICO
- Fix message dedup race
- Fix SSE memory leak
- Fix unread count race
- Add connection pooling
- Create repositories

**Resultado:** Sistema estável em produção

### Sprint 2 (2 semanas) - PERFORMANCE
- Fix N+1 queries
- Add database indexes
- Add UUID validation
- Fix CORS
- Add error states frontend

**Resultado:** Performance 10x melhor

### Sprint 3 (2 semanas) - QUALIDADE
- Add ARIA labels
- Fix event listeners
- Add Error Boundary
- Fix useSSEEvent hook
- Response models

**Resultado:** UX profissional

---

**Próximo Passo:** Implementar Sprint 1 (Correções Críticas Restantes)

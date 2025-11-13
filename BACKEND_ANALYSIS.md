# GhitDesk Backend Architecture - Deep Analysis Report
**Date: 2025-11-13**

---

## EXECUTIVE SUMMARY

The backend architecture has solid fundamentals with proper design patterns (Factory, Strategy, Repository, Singleton), async/await implementation, and good separation of concerns. However, there are **critical issues** related to:

1. **N+1 Query Problems** - Loop-based SLA calculation
2. **Race Conditions** - Unread count operations without locking
3. **Missing Critical Repositories** - Only User repo exists; need Conversation, Message, Ticket
4. **Memory Leaks** - SSE subscriber cleanup issues
5. **Hardcoded Credentials** - Webhook verification token
6. **Missing Error Handling** - Multiple endpoints with minimal error handling
7. **Connection Pool Issues** - Using NullPool without external connection manager

---

## 1. DATABASE DESIGN ANALYSIS

### Issues Found

#### 1.1 Missing Repositories (CRITICAL)
**File:** `/home/user/app_ghitdesk/apps/api/app/db/repositories/`

**Problem:** Only `UserRepository` exists. Missing:
- `ConversationRepository` - Used directly in routes with raw queries
- `MessageRepository` - Used directly in webhooks with raw queries
- `TicketRepository` - Used directly in routes with raw queries
- `ContactRepository` - Not used at all

**Impact:** 
- Code duplication in routes
- Harder to test and maintain
- No business logic encapsulation

**Recommendation:**
Create missing repositories following UserRepository pattern:
```python
# apps/api/app/db/repositories/conversation.py
class ConversationRepository:
    async def get_by_contact_and_channel(self, contact_id: UUID, channel: Channel)
    async def list_by_agent(self, agent_id: UUID, status: Optional[ConversationStatus])
    async def increment_unread(self, conversation_id: UUID)  # ATOMIC
    async def get_with_eager_load(self, conversation_id: UUID)  # Load contact, agent

# apps/api/app/db/repositories/message.py
class MessageRepository:
    async def create_for_conversation(self, conversation_id: UUID, data: dict)
    async def check_duplicate(self, provider_message_id: str)  # Use Redis
    async def get_unread_for_conversation(self, conversation_id: UUID)

# apps/api/app/db/repositories/ticket.py
class TicketRepository:
    async def list_with_filters(self, status, priority, skip, limit)
    async def get_by_number(self, ticket_number: str)
    async def get_with_assignee(self, ticket_id: UUID)

# apps/api/app/db/repositories/contact.py
class ContactRepository:
    async def get_or_create_by_phone(self, phone: str)
    async def get_or_create_by_email(self, email: str)
```

---

#### 1.2 Race Condition: Unread Count (HIGH PRIORITY)
**File:** `/home/user/app_ghitdesk/apps/api/app/models/conversation.py` (Line 46)

**Problem:**
```python
unread_count: Mapped[int] = mapped_column(default=0, nullable=False)
```

This is incremented in `message_service.py` (Line 73):
```python
await broadcast_conversation_update(
    conversation_id=conversation_id,
    changes={
        "unread_count": 1,  # BUG: Just broadcasts, doesn't persist!
    }
)
```

**Issues:**
1. Unread count is never persisted to database
2. Multiple concurrent messages will lose increments (race condition)
3. No atomic increment operation (should use SQL `UPDATE ... SET unread_count = unread_count + 1`)
4. No locking mechanism

**Example Race Condition:**
```
Worker 1: Read unread_count = 3
Worker 2: Read unread_count = 3
Worker 1: Write unread_count = 4
Worker 2: Write unread_count = 4  ← Lost update!
```

**Recommendation:**
```python
# apps/api/app/db/repositories/conversation.py
async def increment_unread_atomic(self, conversation_id: UUID) -> int:
    """Atomically increment unread count"""
    stmt = (
        update(Conversation)
        .where(Conversation.id == conversation_id)
        .values(unread_count=Conversation.unread_count + 1)
        .returning(Conversation.unread_count)
    )
    result = await self.session.execute(stmt)
    await self.session.commit()
    return result.scalar()

# Usage in webhook:
repo = ConversationRepository(session)
new_count = await repo.increment_unread_atomic(conversation_id)
await broadcast_conversation_update(
    conversation_id=conversation_id,
    changes={"unread_count": new_count}
)
```

---

#### 1.3 Missing Message Direction Index (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/models/message.py` (Line 33)

**Problem:**
```python
direction: Mapped[MessageDirection] = mapped_column(SQLEnum(MessageDirection), nullable=False)
# ↑ NO INDEX!
```

Common queries will filter by direction:
```python
# Get all inbound messages for a conversation
SELECT * FROM messages 
WHERE conversation_id = ? AND direction = 'inbound'
```

**Recommendation:**
Add to Message model's `__table_args__`:
```python
__table_args__ = (
    Index("ix_messages_conversation_created", "conversation_id", "created_at"),
    Index("ix_messages_direction", "direction"),  # ← ADD THIS
    Index("ix_messages_conversation_direction", "conversation_id", "direction"),  # ← OR THIS
)
```

---

#### 1.4 Missing is_read Index (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/models/message.py` (Line 46)

**Problem:**
```python
is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
# ↑ NO INDEX!
```

Queries like "Get unread messages for conversation":
```python
SELECT COUNT(*) FROM messages 
WHERE conversation_id = ? AND is_read = false
```

**Recommendation:**
```python
Index("ix_messages_conversation_unread", "conversation_id", "is_read"),
```

---

#### 1.5 Metadata JSONB Columns Lack Indexes (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/models/contact.py` (Line 18) and `message.py` (Line 49)

**Problem:**
```python
metadata_: Mapped[dict] = mapped_column(default=dict, nullable=False)
```

If you query on metadata (e.g., `metadata_->'whatsapp_id'`), no index exists.

**Recommendation:**
```python
# Add GIN index for JSONB if querying metadata
op.create_index(
    'ix_contacts_metadata_gin',
    'contacts',
    ['metadata_'],
    postgresql_using='gin'
)
```

---

### 1.6 Missing Relationship Eager Loading (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/conversations.py` (Line 32)

**Problem:**
```python
conversations = result.scalars().all()

# Then in response, we access:
"contact": conv.contact  # ← Lazy load! Triggers N query
"assigned_agent": conv.assigned_agent  # ← Lazy load! Triggers N query
```

For 50 conversations returned, this causes:
- 1 query to fetch conversations
- 50 queries to fetch contacts
- 50 queries to fetch agents
= **101 queries total**

**Recommendation:**
```python
from sqlalchemy.orm import joinedload

query = select(Conversation).options(
    joinedload(Conversation.contact),
    joinedload(Conversation.assigned_agent)
)

result = await session.execute(query)
conversations = result.unique().scalars().all()
```

---

## 2. API ENDPOINTS ANALYSIS

### 2.1 Hardcoded Webhook Verification Token (HIGH PRIORITY - SECURITY)
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/webhooks.py` (Line 21)

```python
@router.get("/whatsapp")
async def whatsapp_webhook_verify(request: Request):
    VERIFY_TOKEN = "ghitdesk_verify_token"  # ← HARDCODED!
    
    if mode == "subscribe" and token == VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")
```

**Problems:**
1. Token is in source code (visible in git)
2. Not configurable per environment
3. Same token for all environments
4. No secrets management

**Recommendation:**
```python
# apps/api/app/core/config.py
class Settings(BaseSettings):
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: str  # Required from env
    EMAIL_WEBHOOK_VERIFY_TOKEN: str
    TELEGRAM_WEBHOOK_VERIFY_TOKEN: str

# apps/api/app/api/routes/webhooks.py
from app.core.config import get_settings

@router.get("/whatsapp")
async def whatsapp_webhook_verify(request: Request):
    settings = get_settings()
    verify_token = settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN
    # ... rest of code
```

---

### 2.2 Missing Input Validation (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/tickets.py` (Line 81-86)

```python
@router.get("/{ticket_id}")
async def get_ticket(
    ticket_id: str,  # ← Should be validated!
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Ticket).where(Ticket.id == UUID(ticket_id))  # ← Can raise ValueError
    )
```

**Problems:**
1. No validation of ticket_id format before UUID conversion
2. ValueError exception not caught (500 error instead of 400)
3. Same issue in conversations.py

**Recommendation:**
```python
from pydantic import BaseModel
from uuid import UUID

class GetTicketRequest(BaseModel):
    ticket_id: UUID  # Pydantic validates format automatically

@router.get("/{ticket_id}")
async def get_ticket(
    ticket_id: UUID,  # ← Type hint + validation
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    # ...
```

---

### 2.3 Missing Response Models (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/tickets.py`

**Problem:** Routes return raw dicts instead of Pydantic models:

```python
return {
    "id": str(ticket.id),
    "ticket_number": ticket.ticket_number,
    # ... no schema validation
}
```

**Issues:**
1. No OpenAPI/Swagger documentation
2. No automatic response validation
3. No type hints for responses
4. Cannot use response_model in decorator

**Recommendation:**
```python
# apps/api/app/schemas/ticket.py
from pydantic import BaseModel
from datetime import datetime

class TicketResponse(BaseModel):
    id: str
    ticket_number: str
    title: str
    priority: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TicketListResponse(BaseModel):
    tickets: list[TicketResponse]
    total: int
    skip: int
    limit: int

# apps/api/app/api/routes/tickets.py
@router.get("/", response_model=TicketListResponse)
async def list_tickets(...):
    # ... existing code ...
    return TicketListResponse(
        tickets=[...],
        total=total,
        skip=skip,
        limit=limit
    )
```

---

### 2.4 Missing Error Handling and Logging (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/webhooks.py` (Line 52)

```python
except Exception as e:
    print(f"Webhook error: {e}")  # ← Should use logging!
    raise HTTPException(status_code=500, detail=str(e))  # ← Exposes internals!
```

**Problems:**
1. Using `print()` instead of logging
2. Exposing internal errors to clients
3. No structured logging for debugging
4. No error metrics/tracking

**Recommendation:**
```python
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

@router.post("/whatsapp")
async def whatsapp_webhook_inbound(...):
    try:
        payload = await request.json()
        handler = ChannelFactory.create_handler(Channel.WHATSAPP)
        message_data = await handler.handle_webhook(payload)
        processor = MessageProcessor(WhatsAppInboundStrategy())
        result = await processor.handle_message(message_data, session)
        
        logger.info(f"WhatsApp message processed", extra={
            "message_id": message_data.get("message_id"),
            "from": message_data.get("from")
        })
        
        return {"status": "ok", "result": result}
        
    except ValueError as e:
        logger.warning(f"Duplicate message: {e}")
        return {"status": "skipped", "reason": str(e)}
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="Failed to process webhook"  # ← Don't expose error details
        )
```

---

### 2.5 Inconsistent Error Status Codes (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/conversations.py` (Line 76)

```python
if not conversation:
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Conversation not found")
```

**Problems:**
1. Status code as int (404) instead of status constant
2. Mixing imports (should be at top)
3. No consistent error response format
4. No problem details (RFC 7807)

**Recommendation:**
```python
from fastapi import HTTPException, status

if not conversation:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Conversation not found"
    )
```

---

## 3. SERVICES AND BUSINESS LOGIC ANALYSIS

### 3.1 Race Condition in Message Deduplication (CRITICAL)
**File:** `/home/user/app_ghitdesk/apps/api/app/services/message_service.py` (Lines 38-47)

```python
# 1. Check if exists
if await redis.exists(dedup_key):
    raise ValueError("Message already processed")

# 2. Mark as processed
await redis.setex(dedup_key, 86400, "1")
# ↑ RACE CONDITION: Between check and set, duplicate can slip through!
```

**Scenario:**
```
Time 1: Worker A checks dedup_key - doesn't exist
Time 2: Worker B checks dedup_key - doesn't exist
Time 3: Worker A sets dedup_key
Time 4: Worker B sets dedup_key
Result: Same message processed twice! ✗
```

**Recommendation:**
Use Redis GETEX or SET with NX flag (atomic):

```python
# Atomic check-and-set
async def check_and_mark_processed(redis, message_id: str) -> bool:
    """
    Atomically check if processed and mark as processed.
    Returns True if was new (not processed), False if already processed.
    """
    dedup_key = f"message:{message_id}"
    # SET key value EX seconds NX - only set if not exists
    result = await redis.execute(
        "SET", dedup_key, "1", "EX", 86400, "NX"
    )
    return result is not None

# Usage
if not await check_and_mark_processed(redis, message_id):
    raise ValueError("Message already processed")
```

Or use a Lua script:
```python
# apps/api/app/cache/deduplication.py
DEDUP_SCRIPT = """
if redis.call('exists', KEYS[1]) == 1 then
    return 0
else
    redis.call('setex', KEYS[1], ARGV[1], '1')
    return 1
end
"""

async def is_new_message(redis, message_id: str) -> bool:
    dedup_key = f"message:{message_id}"
    return await redis.eval(DEDUP_SCRIPT, 1, dedup_key, 86400)
```

---

### 3.2 N+1 Query Problem in Tickets Route (CRITICAL)
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/tickets.py` (Lines 47-69)

```python
tickets = result.scalars().all()

# SLA calculated PER TICKET (loop)
tickets_with_sla = []
for ticket in tickets:
    sla_info = await sla_service.calculate_sla_for_ticket(
        ticket.priority,
        ticket.created_at
    )
    tickets_with_sla.append({...})
```

**Problem:** This is **not** an N+1 database query issue, but it's a **performance issue**:
- For 50 tickets, runs 50 `calculate_sla_for_ticket()` calls
- SLA calculation does datetime math, which is fast, so not critical
- **However**, if SLA service needs to query database (future), this becomes N+1

**Recommendation:** Move SLA calculation to database query time:

```python
# Option 1: Calculate in SELECT
query = select(
    Ticket,
    (Ticket.resolution_due_at - func.now()).label("time_remaining")
)

# Option 2: Batch process with asyncio
async def get_tickets_with_sla(session, filters, skip, limit):
    query = select(Ticket).offset(skip).limit(limit)
    result = await session.execute(query)
    tickets = result.scalars().all()
    
    sla_service = SLAService()
    
    # Calculate in parallel
    sla_infos = await asyncio.gather(
        *[sla_service.calculate_sla_for_ticket(t.priority, t.created_at) 
          for t in tickets]
    )
    
    return [{**ticket_data, "sla": sla} 
            for ticket_data, sla in zip(tickets_data, sla_infos)]
```

---

### 3.3 Missing Transaction Handling (HIGH)
**File:** `/home/user/app_ghitdesk/apps/api/app/services/message_service.py` (Lines 37-75)

**Problem:** Multiple database/cache operations without transaction:

```python
# 1. Check Redis
if await redis.exists(dedup_key):
    raise ValueError("Message already processed")

# 2. Mark Redis
await redis.setex(dedup_key, 86400, "1")

# 3. Broadcast SSE ← Can fail!
await broadcast_new_message(...)

# 4. Update conversation ← But marked as processed!
await broadcast_conversation_update(...)
```

**Scenario:** If Redis mark succeeds but SSE broadcast fails, message is marked as processed but never displayed.

**Recommendation:**
```python
async def handle_message(self, message_data: dict, session: AsyncSession) -> dict:
    from sqlalchemy import select
    
    message_id = message_data.get("message_id", "")
    dedup_key = f"message:{message_id}"
    
    # Use transaction
    async with session.begin():
        redis = await RedisClient.get_instance()
        
        try:
            # 1. Mark as processed FIRST (atomic)
            if not await redis.set(dedup_key, "1", ex=86400, nx=True):
                raise ValueError("Message already processed")
            
            # 2. Create conversation/message in DB
            conversation = await self._get_or_create_conversation(
                message_data, session
            )
            
            message = Message(
                conversation_id=conversation.id,
                body=message_data.get("text", ""),
                direction=MessageDirection.INBOUND,
                # ...
            )
            session.add(message)
            await session.flush()  # Get message.id before commit
            
            # 3. Broadcast SSE (after DB commit)
            await session.commit()
            await broadcast_new_message(
                conversation_id=str(conversation.id),
                message={"id": str(message.id), "text": message.body}
            )
            
            return {"status": "processed", "message_id": message_id}
            
        except Exception as e:
            await session.rollback()
            # Redis mark is already set, that's OK (duplicates fail gracefully)
            raise
```

---

### 3.4 SSE Memory Leak (CRITICAL)
**File:** `/home/user/app_ghitdesk/apps/api/app/integrations/sse_manager.py` (Lines 70-86)

```python
async def subscribe(self, client_id: str) -> AsyncGenerator[str, None]:
    queue = asyncio.Queue()
    self._subscribers[client_id] = queue  # ← Add to dict
    
    try:
        while True:
            message = await queue.get()
            yield f"data: {json.dumps(message)}\n\n"
    except asyncio.CancelledError:
        pass
    finally:
        # Cleanup
        if client_id in self._subscribers:
            del self._subscribers[client_id]
```

**Memory Leak Scenario:**
1. Client connects → `queue = asyncio.Queue()` created
2. **Browser tab closes abruptly** (no graceful disconnect)
3. Generator never reaches `finally` block
4. Queue remains in `_subscribers` dict forever
5. Memory grows with each disconnection

**Recommendation:**
```python
async def subscribe(self, client_id: str) -> AsyncGenerator[str, None]:
    queue = asyncio.Queue()
    self._subscribers[client_id] = queue
    disconnected = False
    
    try:
        while True:
            try:
                # Timeout to detect stale connections
                message = await asyncio.wait_for(queue.get(), timeout=300.0)
                yield f"data: {json.dumps(message)}\n\n"
            except asyncio.TimeoutError:
                # Client didn't receive anything for 5 min, probably disconnected
                logger.warning(f"SSE client {client_id} timeout, cleaning up")
                disconnected = True
                break
                
    except asyncio.CancelledError:
        disconnected = True
    except Exception as e:
        logger.error(f"SSE error for client {client_id}: {e}")
        disconnected = True
    finally:
        # Always cleanup
        if client_id in self._subscribers:
            del self._subscribers[client_id]
            logger.debug(f"SSE client {client_id} disconnected")
        
        # Log current subscriber count
        logger.info(f"Active SSE subscribers: {len(self._subscribers)}")
```

---

### 3.5 Unhandled Queue.put Failures (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/integrations/sse_manager.py` (Lines 88-101)

```python
async def broadcast(self, event: str, data: dict) -> None:
    # Send to all connected clients
    for queue in self._subscribers.values():
        try:
            await queue.put(message)
        except Exception:
            pass  # ← Silently fails!
```

**Problem:** If queue.put() fails (queue full, task done), exception is silently swallowed.

**Recommendation:**
```python
async def broadcast(self, event: str, data: dict) -> None:
    message = {
        "event": event,
        "data": data,
        "timestamp": data.get("timestamp", ""),
    }
    
    # Send to all connected clients
    failed_clients = []
    for client_id, queue in list(self._subscribers.items()):
        try:
            # Don't block if queue is full
            queue.put_nowait(message)
        except asyncio.QueueFull:
            logger.warning(f"SSE queue full for client {client_id}")
            failed_clients.append(client_id)
        except Exception as e:
            logger.error(f"SSE broadcast error for client {client_id}: {e}")
            failed_clients.append(client_id)
    
    # Cleanup dead clients
    for client_id in failed_clients:
        if client_id in self._subscribers:
            del self._subscribers[client_id]
    
    # Also publish to Redis for multi-worker support
    try:
        redis = await RedisClient.get_instance()
        await redis.publish("sse_events", json.dumps(message))
    except Exception as e:
        logger.error(f"Redis broadcast failed: {e}")
```

---

### 3.6 Redis Listener Task Never Stops (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/integrations/sse_manager.py` (Lines 34-68)

```python
async def start_redis_listener(self):
    if self._redis_listener_task is not None:
        return
    
    # ... create task
    self._redis_listener_task = asyncio.create_task(listen())
    # ↑ Task runs forever, even if app shuts down!
```

**Problem:** On app shutdown, background task is not cancelled.

**Recommendation:**
```python
async def start_redis_listener(self):
    if self._redis_listener_task is not None:
        return
    
    # ... existing code ...
    self._redis_listener_task = asyncio.create_task(listen())

async def stop_redis_listener(self):
    """Call on app shutdown"""
    if self._redis_listener_task and not self._redis_listener_task.done():
        self._redis_listener_task.cancel()
        try:
            await self._redis_listener_task
        except asyncio.CancelledError:
            logger.info("Redis listener stopped")

# In apps/api/app/main.py lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Application starting...")
    DatabaseSessionFactory.initialize()
    await RedisClient.get_instance()
    
    yield
    
    # Shutdown
    print("🛑 Application shutting down...")
    sse_manager = SSEManager.get_instance()
    await sse_manager.stop_redis_listener()  # ← ADD THIS
    await DatabaseSessionFactory.close()
    await RedisClient.close()
```

---

## 4. PERFORMANCE ISSUES

### 4.1 Missing Database Connection Pooling (HIGH)
**File:** `/home/user/app_ghitdesk/apps/api/app/db/database.py` (Line 49)

```python
cls._engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    poolclass=NullPool,  # ← THIS IS THE PROBLEM!
    future=True,
)
```

**Problem:** `NullPool` means no connection pooling:
- Every query creates a new connection
- 10x-100x slower than pooled connections
- Comment says "Use external pool (PgBouncer) in prod" but no setup

**Recommendation:**
```python
from sqlalchemy.pool import QueuePool, NullPool

# Development: Use NullPool (fine for single worker)
# Production: Use connection pooling

poolclass = NullPool if settings.DEBUG else QueuePool

cls._engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    poolclass=poolclass,
    pool_size=10 if not settings.DEBUG else None,
    max_overflow=20 if not settings.DEBUG else None,
    pool_pre_ping=True,  # Verify connection before using
    future=True,
)
```

Or add to config:
```python
# apps/api/app/core/config.py
class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_POOL_MAX_OVERFLOW: int = 20
    DATABASE_POOL_PRE_PING: bool = True
```

---

### 4.2 Missing Query Caching (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/tickets.py` (Lines 15-76)

**Problem:** Every list_tickets request re-queries the database:

```
Request 1: SELECT * FROM tickets ... → Database query
Request 2: SELECT * FROM tickets ... → Database query again (same results!)
```

**Recommendation:** Add Redis caching for read-heavy queries:

```python
# apps/api/app/cache/query_cache.py
class QueryCache:
    def __init__(self, redis: redis.Redis, ttl: int = 300):
        self.redis = redis
        self.ttl = ttl
    
    async def get_or_fetch(
        self,
        key: str,
        fetch_fn: Callable,
        *args,
        **kwargs
    ):
        # Try cache
        cached = await self.redis.get(key)
        if cached:
            return orjson.loads(cached)
        
        # Fetch
        result = await fetch_fn(*args, **kwargs)
        
        # Cache
        await self.redis.setex(
            key,
            self.ttl,
            orjson.dumps(result).decode()
        )
        
        return result

# Usage in route
@router.get("/")
async def list_tickets(
    status: Optional[TicketStatus] = None,
    skip: int = 0,
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
):
    redis = await RedisClient.get_instance()
    cache = QueryCache(redis, ttl=300)
    
    cache_key = f"tickets:{status}:{skip}:{limit}"
    
    return await cache.get_or_fetch(
        cache_key,
        fetch_tickets,  # async function
        session, status, skip, limit
    )
```

---

### 4.3 Missing Indices Summary

**File:** Migration and Model definitions

| Table | Column | Index | Priority |
|-------|--------|-------|----------|
| messages | direction | Missing | MEDIUM |
| messages | is_read | Missing | MEDIUM |
| messages | (conversation_id, direction) | Missing | MEDIUM |
| messages | (conversation_id, is_read) | Missing | MEDIUM |
| conversations | unread_count | Missing | LOW (rarely filters) |
| tickets | ticket_number | EXISTS | ✓ |
| users | email | EXISTS | ✓ |

---

### 4.4 SQLAlchemy Session Not Optimized (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/db/database.py` (Lines 53-59)

```python
cls._session_factory = async_sessionmaker(
    cls._engine,
    class_=AsyncSession,
    expire_on_commit=False,  # ← Might cause stale data
    autocommit=False,
    autoflush=False,  # ← Good for performance
)
```

**Issue:** `expire_on_commit=False` can return stale objects after commit.

**Recommendation:**
```python
cls._session_factory = async_sessionmaker(
    cls._engine,
    class_=AsyncSession,
    expire_on_commit=True,   # ← Ensure fresh data
    autocommit=False,
    autoflush=False,
    join_transaction_mode="create",  # ← Better transaction handling
)
```

---

## 5. SECURITY ISSUES

### 5.1 Webhook Token Hardcoded (CRITICAL)
Already covered in Section 2.1

---

### 5.2 Missing CORS Validation (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/main.py` (Lines 39-45)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # ← Uses config
    allow_credentials=True,
    allow_methods=["*"],  # ← TOO PERMISSIVE!
    allow_headers=["*"],  # ← TOO PERMISSIVE!
)
```

**Problems:**
1. Allow all HTTP methods (POST, DELETE, PATCH)
2. Allow all headers
3. Should be more restrictive

**Recommendation:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["X-Total-Count"],  # For pagination
    max_age=3600,  # Cache CORS preflight
)
```

---

### 5.3 Error Messages Expose Internal Details (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/webhooks.py` (Line 53)

```python
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
    # ↑ Exposes internal error messages to client!
```

Already covered in Section 2.4

---

## 6. ASYNC/AWAIT ISSUES

### 6.1 Async Function Not Awaited (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/api/app/db/repositories/user.py` (Lines 39-51)

```python
async def create(self, ...):
    user = User(...)
    self.session.add(user)
    await self.session.commit()  # ← Good
    await self.session.refresh(user)  # ← Good
    return user
```

This is fine, but there's no `try/except` for constraint violations.

---

## SUMMARY TABLE

| Issue | File | Severity | Type |
|-------|------|----------|------|
| Missing repositories | `app/db/repositories/` | CRITICAL | Architecture |
| Race condition: unread_count | `models/conversation.py` | CRITICAL | Concurrency |
| Race condition: message dedup | `services/message_service.py` | CRITICAL | Concurrency |
| N+1 Query: SLA calculation | `api/routes/tickets.py` | HIGH | Performance |
| Hardcoded webhook token | `api/routes/webhooks.py` | CRITICAL | Security |
| SSE memory leak | `integrations/sse_manager.py` | CRITICAL | Memory |
| Missing input validation | `api/routes/` | HIGH | Validation |
| Missing connection pooling | `db/database.py` | HIGH | Performance |
| Missing lazy-load eager load | `api/routes/conversations.py` | HIGH | Performance |
| Missing indexes (message) | `models/message.py` | MEDIUM | Performance |
| Missing error handling | `api/routes/webhooks.py` | MEDIUM | Reliability |
| Missing response models | `api/routes/` | MEDIUM | Documentation |
| Missing transaction handling | `services/message_service.py` | HIGH | Reliability |
| Error status codes inconsistent | `api/routes/` | MEDIUM | API Quality |
| CORS too permissive | `main.py` | MEDIUM | Security |
| Missing logging | Multiple | MEDIUM | Observability |

---

## RECOMMENDATIONS PRIORITY

### Phase 1 (CRITICAL - Do First)
1. Create ConversationRepository with atomic unread_count increment
2. Fix message deduplication race condition (use Redis SET NX)
3. Remove hardcoded webhook tokens
4. Fix SSE memory leak (timeout cleanup)
5. Add database connection pooling

### Phase 2 (HIGH - Do Next)
6. Create MessageRepository, TicketRepository, ContactRepository
7. Add input validation for all UUID parameters
8. Fix eager loading in conversation queries
9. Add transaction handling in message_service
10. Add proper error handling and logging

### Phase 3 (MEDIUM - Do Later)
11. Add missing database indexes
12. Add response models (Pydantic schemas)
13. Add query caching for read-heavy operations
14. Improve CORS configuration
15. Add comprehensive test coverage


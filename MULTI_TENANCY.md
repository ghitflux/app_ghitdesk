# 🏢 GhitDesk Multi-Tenancy Architecture

Documentação completa da implementação de multi-tenancy no GhitDesk.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Isolamento de Dados](#isolamento-de-dados)
- [Autenticação & Autorização](#autenticação--autorização)
- [API Endpoints](#api-endpoints)
- [Webhooks](#webhooks)
- [Como Adicionar Novos Tenants](#como-adicionar-novos-tenants)
- [Testes de Isolamento](#testes-de-isolamento)
- [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

O GhitDesk implementa **multi-tenancy a nível de linha** (row-level multi-tenancy), onde:

- Cada cliente (tenant) compartilha a mesma instância da aplicação e banco de dados
- Os dados são isolados através de um campo `tenant_id` em todas as tabelas
- Cada usuário pertence a um único tenant
- Usuários só podem acessar dados do seu próprio tenant

### Vantagens

✅ **Econômico:** Uma única instância atende múltiplos clientes
✅ **Fácil Manutenção:** Atualizações aplicadas uma vez para todos
✅ **Escalável:** Adicionar novos tenants é simples
✅ **Seguro:** Isolamento garantido por queries filtradas

### Desvantagens

⚠️ **Compartilhamento de Recursos:** Tenants compartilham CPU/memória
⚠️ **Risco de Data Leakage:** Requer atenção nas queries
⚠️ **Complexidade:** Todas as queries precisam filtrar por tenant

---

## 🏗️ Arquitetura

### Database Schema

```
┌─────────────┐
│   tenants   │
├─────────────┤
│ id (PK)     │
│ name        │
│ slug        │◄──────┐
│ is_active   │       │
│ created_at  │       │
└─────────────┘       │
                      │ tenant_id (FK)
                      │
┌──────────────────┐  │
│ users            │  │
├──────────────────┤  │
│ id (PK)          │  │
│ tenant_id (FK)   │──┘
│ name             │
│ email            │
│ password_hash    │
│ role             │
│ ...              │
└──────────────────┘

┌──────────────────┐
│ contacts         │
├──────────────────┤
│ id (PK)          │
│ tenant_id (FK)   │──┐
│ name             │  │
│ phone            │  │
│ email            │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│ conversations    │  │
├──────────────────┤  │
│ id (PK)          │  │
│ tenant_id (FK)   │──┤
│ contact_id (FK)  │  │
│ channel          │  │
│ status           │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│ messages         │  │
├──────────────────┤  │
│ id (PK)          │  │
│ tenant_id (FK)   │──┤
│ conversation_id  │  │
│ body             │  │
│ ...              │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│ tickets          │  │
├──────────────────┤  │
│ id (PK)          │  │
│ tenant_id (FK)   │──┘
│ ticket_number    │
│ title            │
│ priority         │
│ status           │
└──────────────────┘
```

### Tenant Model

```python
class Tenant(Base):
    __tablename__ = "tenants"

    id: UUID  # Primary Key
    name: str  # "Acme Corporation"
    slug: str  # "acme" (unique, used for routing)
    is_active: bool  # Soft delete
    created_at: datetime
    updated_at: datetime
```

### Unique Constraints

**Per-Tenant Unique:**
- `users (tenant_id, email)` - Email único por tenant
- `tickets (tenant_id, ticket_number)` - Ticket number único por tenant

Isso permite:
- Mesmo email em tenants diferentes
- Mesmos ticket numbers (ACME-1000, TECHSTART-1000)

---

## 🔒 Isolamento de Dados

### 1. Models com tenant_id

Todos os models incluem `tenant_id`:

```python
class Conversation(Base):
    id: UUID = mapped_column(primary_key=True)
    tenant_id: UUID = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    # ... outros campos

    # Relationship
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="conversations")
```

### 2. Repositories com Filtro Tenant

Todos os repositories filtram por `tenant_id`:

```python
class UserRepository:
    async def get_by_email(self, email: str, tenant_id: UUID) -> Optional[User]:
        """Get user by email within tenant"""
        result = await self.session.execute(
            select(User).where(
                User.email == email,
                User.tenant_id == tenant_id  # SEMPRE FILTRA
            )
        )
        return result.scalars().first()
```

### 3. Routes com Dependency Injection

Routes recebem `tenant_id` automaticamente:

```python
from app.core.dependencies import TenantId

@router.get("/tickets")
async def list_tickets(
    tenant_id: TenantId,  # Injetado automaticamente
    session: AsyncSession = Depends(get_session),
):
    # tenant_id já está disponível
    query = select(Ticket).where(Ticket.tenant_id == tenant_id)
```

---

## 🔐 Autenticação & Autorização

### JWT Payload

JWT inclui `tenant_id`:

```json
{
  "sub": "user-uuid",
  "email": "admin@acme.com",
  "role": "admin",
  "tenant_id": "tenant-uuid",  // ← IMPORTANTE
  "exp": 1234567890
}
```

### Middleware de Tenant

Middleware extrai `tenant_id` do JWT e armazena em `request.state`:

```python
@app.middleware("http")
async def tenant_context_middleware(request: Request, call_next):
    access_token = request.cookies.get("access_token")

    if access_token:
        payload = decode_token(access_token)
        request.state.tenant_id = UUID(payload["tenant_id"])
        request.state.user_id = UUID(payload["sub"])

    response = await call_next(request)
    return response
```

### Dependency Injection

Dependencies extraem do `request.state`:

```python
async def get_current_tenant_id_from_request(request: Request) -> UUID:
    if not hasattr(request.state, "tenant_id"):
        raise HTTPException(status_code=403, detail="Tenant context not found")
    return request.state.tenant_id

# Type alias para uso fácil
TenantId = Annotated[UUID, Depends(get_current_tenant_id_from_request)]
```

---

## 🌐 API Endpoints

### Endpoints Protegidos (Tenant-Scoped)

#### GET /tickets
Retorna apenas tickets do tenant autenticado

**Request:**
```bash
curl http://localhost:8000/tickets \
  -b cookies.txt  # Cookie com JWT
```

**Response:**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "ticket_number": "ACME-1000",  // ← Prefixo do tenant
      "title": "Issue",
      "priority": "high",
      "tenant_id": "tenant-uuid"  // ← Mesmo tenant do usuário
    }
  ],
  "total": 3
}
```

#### GET /conversations
Retorna apenas conversas do tenant autenticado

**Request:**
```bash
curl http://localhost:8000/conversations \
  -b cookies.txt
```

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "channel": "whatsapp",
      "status": "open"
      // Todas pertencem ao tenant do usuário
    }
  ],
  "total": 5
}
```

---

## 📡 Webhooks

Webhooks não têm JWT, então usam **headers customizados**:

### Opção 1: X-Tenant-Slug (Recomendado)

```bash
curl -X POST http://localhost:8000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: acme" \  # ← Identifica o tenant
  -d '{"message": "..."}'
```

### Opção 2: X-Tenant-Id

```bash
curl -X POST http://localhost:8000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: uuid-do-tenant" \
  -d '{"message": "..."}'
```

### Opção 3: Fallback (Desenvolvimento)

Se nenhum header, usa tenant "default" (apenas para desenvolvimento).

### Implementação

```python
async def get_tenant_from_webhook(request: Request, session: AsyncSession) -> UUID:
    """
    Priority:
    1. X-Tenant-Slug header (most secure)
    2. X-Tenant-Id header
    3. Default tenant (fallback)
    """
    tenant_slug = request.headers.get("X-Tenant-Slug")
    if tenant_slug:
        tenant = await tenant_repo.get_active_by_slug(tenant_slug)
        return tenant.id

    # ... fallback logic
```

---

## ➕ Como Adicionar Novos Tenants

### Via Script Python

```python
from app.db.repositories.tenant import TenantRepository
from app.db.database import get_session

async def create_tenant():
    async with get_session() as session:
        tenant_repo = TenantRepository(session)

        new_tenant = await tenant_repo.create(
            name="New Company Inc",
            slug="newcompany",
            is_active=True
        )

        print(f"Tenant criado: {new_tenant.id}")
        return new_tenant
```

### Via SQL Direto

```sql
INSERT INTO tenants (id, name, slug, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'New Company Inc',
    'newcompany',
    true,
    NOW(),
    NOW()
);
```

### Criar Usuários para o Tenant

```python
from app.db.repositories.user import UserRepository
from app.core.security import hash_password
from app.models.user import Role

async def create_admin_user(tenant_id: UUID):
    async with get_session() as session:
        user_repo = UserRepository(session)

        admin = await user_repo.create(
            tenant_id=tenant_id,
            name="Admin User",
            email="admin@newcompany.com",
            password_hash=hash_password("secure_password"),
            role=Role.ADMIN
        )

        print(f"Admin criado: {admin.email}")
```

---

## 🧪 Testes de Isolamento

### Teste Automatizado (pytest)

```python
@pytest.mark.asyncio
async def test_user_isolation_by_tenant(async_session):
    """Test that users are isolated by tenant"""
    tenant1 = await create_tenant("Company A", "company-a")
    tenant2 = await create_tenant("Company B", "company-b")

    # Criar usuários com MESMO email em tenants diferentes
    user1 = await create_user(tenant1.id, "john@example.com")
    user2 = await create_user(tenant2.id, "john@example.com")

    # Buscar por tenant específico
    fetched1 = await user_repo.get_by_email("john@example.com", tenant1.id)
    fetched2 = await user_repo.get_by_email("john@example.com", tenant2.id)

    # Deve retornar usuários DIFERENTES
    assert fetched1.id == user1.id
    assert fetched2.id == user2.id
    assert fetched1.id != fetched2.id  # ✓ Isolamento confirmado
```

### Teste Manual (curl)

```bash
# Login Tenant 1
curl -X POST http://localhost:8000/auth/login \
  -d '{"email":"admin@acme.com","password":"admin123"}' \
  -c t1.txt

# Login Tenant 2
curl -X POST http://localhost:8000/auth/login \
  -d '{"email":"admin@techstart.com","password":"admin123"}' \
  -c t2.txt

# Buscar tickets Tenant 1
curl http://localhost:8000/tickets -b t1.txt | jq '.tickets[].ticket_number'
# Output: ["ACME-1000", "ACME-1001", "ACME-1002"]

# Buscar tickets Tenant 2
curl http://localhost:8000/tickets -b t2.txt | jq '.tickets[].ticket_number'
# Output: ["TECHSTART-1000", "TECHSTART-1001", "TECHSTART-1002"]

# ✓ Dados completamente diferentes!
```

---

## ✅ Boas Práticas

### 1. SEMPRE Filtrar por tenant_id

```python
# ✅ CORRETO
query = select(Ticket).where(
    Ticket.tenant_id == tenant_id,
    Ticket.status == TicketStatus.OPEN
)

# ❌ ERRADO - Retorna tickets de TODOS os tenants!
query = select(Ticket).where(Ticket.status == TicketStatus.OPEN)
```

### 2. Usar Dependencies para tenant_id

```python
# ✅ CORRETO - tenant_id injetado automaticamente
@router.get("/tickets")
async def list_tickets(tenant_id: TenantId):
    ...

# ❌ ERRADO - Pode esquecer de filtrar
@router.get("/tickets")
async def list_tickets():
    ...
```

### 3. Índices Compostos

```python
# ✅ CORRETO - Índice composto para performance
__table_args__ = (
    Index("ix_tickets_tenant_status", "tenant_id", "status"),
)

# Query rápida:
SELECT * FROM tickets WHERE tenant_id = ? AND status = ?
```

### 4. Validar tenant_id em Relacionamentos

```python
# Ao criar um ticket, verificar se conversation pertence ao mesmo tenant
conversation = await get_conversation(conv_id, tenant_id)
if conversation.tenant_id != tenant_id:
    raise HTTPException(403, "Conversation belongs to different tenant")
```

### 5. Soft Delete para Tenants

```python
# Não deletar tenants, apenas marcar como inativo
tenant.is_active = False
await session.commit()

# Queries devem verificar is_active
query = select(Tenant).where(Tenant.slug == slug, Tenant.is_active == True)
```

---

## 🚨 Cenários de Risco

### ⚠️ Risco 1: Query sem Filtro de Tenant

```python
# ❌ PERIGO!
all_tickets = await session.execute(select(Ticket).where(Ticket.status == "open"))
# Retorna tickets de TODOS os tenants!
```

**Solução:** Sempre incluir `tenant_id` no WHERE

### ⚠️ Risco 2: Webhook sem Validação de Tenant

```python
# ❌ PERIGO!
@router.post("/webhooks/whatsapp")
async def handle_webhook(payload: dict):
    # Webhook não sabe qual tenant!
    conversation = await create_conversation(...)  # Para qual tenant??
```

**Solução:** Requer header `X-Tenant-Slug`

### ⚠️ Risco 3: Admin Global

```python
# ❌ PERIGO!
if user.role == "super_admin":
    # Permite acesso cross-tenant
    tickets = await get_all_tickets()  # TODOS os tenants!
```

**Solução:** Mesmo admins devem estar vinculados a um tenant

---

## 📊 Monitoramento

### Queries Lentas

Verificar se índices de tenant estão sendo usados:

```sql
EXPLAIN ANALYZE
SELECT * FROM tickets
WHERE tenant_id = 'uuid' AND status = 'open';

-- Deve usar: ix_tickets_tenant_status
```

### Violações de Isolamento

Log suspeito:
```python
logger.warning(f"User {user_id} tentou acessar ticket de outro tenant")
```

### Métricas por Tenant

```python
# Queries por tenant
SELECT tenant_id, COUNT(*) FROM tickets GROUP BY tenant_id;

# Performance por tenant
SELECT tenant_id, AVG(query_time) FROM logs GROUP BY tenant_id;
```

---

## 🔄 Migration de Single-Tenant para Multi-Tenant

Se você tem dados existentes:

```sql
-- 1. Adicionar tenant_id (nullable primeiro)
ALTER TABLE users ADD COLUMN tenant_id UUID;

-- 2. Criar tenant default
INSERT INTO tenants (id, name, slug) VALUES (uuid_generate_v4(), 'Default', 'default');

-- 3. Migrar dados existentes
UPDATE users SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default');

-- 4. Tornar tenant_id NOT NULL
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;

-- 5. Adicionar FK
ALTER TABLE users ADD CONSTRAINT fk_users_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
```

---

## 📚 Recursos Adicionais

- [Row-Level Security no PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multi-tenancy)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**Última atualização:** 2025-11-18
**Versão:** 1.0.0

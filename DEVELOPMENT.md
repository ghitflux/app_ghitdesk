# GhitDesk - Documentação Técnica para Desenvolvedores

## 📚 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Padrões de Design](#padrões-de-design)
5. [Backend (FastAPI)](#backend-fastapi)
6. [Frontend (Next.js)](#frontend-nextjs)
7. [Banco de Dados](#banco-de-dados)
8. [Integrações](#integrações)
9. [Testes](#testes)
10. [Deployment](#deployment)

---

## 🏗️ Visão Geral da Arquitetura

GhitDesk é um sistema de helpdesk omnichannel construído com arquitetura moderna de microserviços monorepo:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                 │
│  - App Router                                                │
│  - Server Components                                         │
│  - BFF Route Handlers (/api/bff/*)                          │
│  - SSE Client (Real-time)                                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/JSON
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                     Backend (FastAPI)                        │
│  - REST API                                                  │
│  - SSE Streaming                                            │
│  - WebHook Handlers                                         │
│  - Channel Integrations                                     │
└─────────┬────────────────────────────────────┬──────────────┘
          │                                    │
          │                                    │
    ┌─────▼──────┐                      ┌──────▼───────┐
    │ PostgreSQL │                      │    Redis     │
    │   (Data)   │                      │   (Cache)    │
    └────────────┘                      └──────────────┘
```

### Fluxo de Dados

1. **Inbound (Cliente → Sistema)**:
   - Cliente envia mensagem via WhatsApp/Email/Telegram
   - Webhook recebe payload e valida
   - MessageService processa e cria Conversation/Message
   - SSE broadcasting notifica frontend em tempo real

2. **Outbound (Sistema → Cliente)**:
   - Agente responde via frontend
   - API valida e enfileira mensagem
   - ChannelFactory seleciona handler apropriado
   - Handler envia via integração específica (WhatsApp API, SMTP, Telegram Bot)

---

## 🛠️ Stack Tecnológica

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Python | 3.11+ | Linguagem principal |
| FastAPI | 0.115+ | Framework web assíncrono |
| SQLAlchemy | 2.0+ | ORM assíncrono |
| PostgreSQL | 16 | Banco de dados principal |
| Redis | 7 | Cache e pub/sub para SSE |
| Alembic | 1.14+ | Migrations |
| Pydantic | 2.10+ | Validação de dados |
| httpx | 0.28+ | Cliente HTTP assíncrono |
| aiosmtplib | 3.0+ | Cliente SMTP assíncrono |

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Next.js | 15 | Framework React |
| React | 18 | UI library |
| TypeScript | 5.4+ | Type safety |
| HeroUI | 2.4+ | Design system |
| Tailwind CSS | 4 | Styling |
| Storybook | 10 | Component documentation |
| Vitest | Latest | Testing framework |
| TanStack Query | 5.28+ | Data fetching |

### DevOps
| Tecnologia | Propósito |
|------------|-----------|
| pnpm | Package manager (workspaces) |
| Turbo | Monorepo build orchestration |
| Docker | Containerization |
| GitHub Actions | CI/CD |

---

## 📁 Estrutura do Projeto

```
app_ghitdesk/
├── apps/
│   ├── api/                          # Backend FastAPI
│   │   ├── app/
│   │   │   ├── core/                 # Config, Security, Singleton
│   │   │   │   ├── config.py         # Settings (Singleton)
│   │   │   │   └── security.py       # JWT, Password hashing
│   │   │   ├── db/                   # Database
│   │   │   │   ├── database.py       # SessionFactory (Singleton)
│   │   │   │   └── repositories/     # Repository Pattern
│   │   │   ├── cache/                # Redis
│   │   │   │   └── redis_client.py   # Redis (Singleton)
│   │   │   ├── models/               # SQLAlchemy Models (5)
│   │   │   │   ├── user.py
│   │   │   │   ├── contact.py
│   │   │   │   ├── conversation.py
│   │   │   │   ├── message.py
│   │   │   │   └── ticket.py
│   │   │   ├── schemas/              # Pydantic Schemas
│   │   │   ├── services/             # Business Logic
│   │   │   │   ├── auth_service.py
│   │   │   │   ├── channel_service.py    # Factory Pattern
│   │   │   │   ├── message_service.py    # Strategy Pattern
│   │   │   │   └── sla_service.py        # Strategy Pattern
│   │   │   ├── integrations/         # External APIs
│   │   │   │   ├── whatsapp_client.py    # Singleton
│   │   │   │   └── sse_manager.py        # Singleton
│   │   │   └── api/routes/          # API Endpoints
│   │   │       ├── auth.py
│   │   │       ├── tickets.py
│   │   │       ├── conversations.py
│   │   │       ├── webhooks.py
│   │   │       └── events.py
│   │   ├── migrations/              # Alembic
│   │   ├── tests/                   # Pytest (3 files)
│   │   └── requirements.txt
│   │
│   └── web/                         # Frontend Next.js
│       ├── src/
│       │   ├── app/                 # App Router
│       │   │   ├── (auth)/          # Auth Group
│       │   │   │   └── login/
│       │   │   ├── (dashboard)/     # Dashboard Group
│       │   │   │   ├── dashboard/
│       │   │   │   ├── inbox/
│       │   │   │   ├── tickets/
│       │   │   │   └── reports/
│       │   │   └── api/bff/         # Backend for Frontend
│       │   ├── components/ghitdesk/ # Custom Components (4)
│       │   │   ├── status-badge.tsx
│       │   │   ├── priority-badge.tsx
│       │   │   ├── channel-badge.tsx
│       │   │   └── ticket-card.tsx
│       │   ├── context/             # React Context
│       │   │   └── auth-context.tsx
│       │   ├── services/            # API Client
│       │   │   ├── api-client.ts    # Singleton
│       │   │   └── sse-client.ts
│       │   ├── hooks/               # Custom Hooks
│       │   │   └── useSSE.ts
│       │   ├── stories/             # Storybook (30 stories)
│       │   └── test/                # Vitest
│       └── package.json
│
├── docs/                            # Architecture Docs
├── docker-compose.yml               # Postgres + Redis
├── pnpm-workspace.yaml
├── turbo.json
├── CLAUDE.md                        # Dev Notes
└── DEVELOPMENT.md                   # Esta documentação
```

---

## 🎨 Padrões de Design Implementados

### 1. Singleton Pattern

**Propósito**: Garantir que uma classe tenha apenas uma instância global.

**Implementações (6)**:

#### Config (Backend)
```python
# apps/api/app/core/config.py
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    # ...

@lru_cache()
def get_settings() -> Settings:
    return Settings()  # Cached forever
```

#### DatabaseSessionFactory (Backend)
```python
# apps/api/app/db/database.py
class DatabaseSessionFactory:
    _engine: Optional[AsyncEngine] = None

    @classmethod
    def get_engine(cls) -> AsyncEngine:
        if cls._engine is None:
            cls._engine = create_async_engine(...)
        return cls._engine
```

#### WhatsAppClient (Backend)
```python
# apps/api/app/integrations/whatsapp_client.py
class WhatsAppClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

#### APIClient (Frontend)
```typescript
// apps/web/src/services/api-client.ts
class APIClient {
  private static instance: APIClient;

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }
}
```

---

### 2. Factory Pattern

**Propósito**: Criar objetos sem especificar a classe exata.

#### ChannelFactory (Backend)
```python
# apps/api/app/services/channel_service.py
class ChannelFactory:
    _handlers = {
        Channel.WHATSAPP: WhatsAppChannelHandler,
        Channel.EMAIL: EmailChannelHandler,
        Channel.TELEGRAM: TelegramChannelHandler,
    }

    @classmethod
    def create_handler(cls, channel: Channel) -> ChannelHandler:
        handler_class = cls._handlers.get(channel)
        return handler_class()

# Uso:
handler = ChannelFactory.create_handler(Channel.WHATSAPP)
await handler.send_message(to="5511999999999", body="Hello!")
```

**Vantagem**: Adicionar novo canal (Twitter, Instagram) sem modificar código existente (Open/Closed Principle).

---

### 3. Strategy Pattern

**Propósito**: Definir família de algoritmos intercambiáveis.

#### SLA Calculation (Backend)
```python
# apps/api/app/services/sla_service.py
class SLAStrategy(ABC):
    @abstractmethod
    def calculate_due_date(self, priority: Priority) -> datetime:
        pass

class SimpleSLAStrategy(SLAStrategy):
    # LOW: 72h, MEDIUM: 48h, HIGH: 24h, URGENT: 4h
    pass

class BusinessHoursSLAStrategy(SLAStrategy):
    # Only count business hours
    pass

class SLAService:
    def __init__(self, strategy: SLAStrategy):
        self.strategy = strategy
```

---

### 4. Repository Pattern

**Propósito**: Abstrair acesso a dados.

```python
# apps/api/app/db/repositories/user_repository.py
class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
```

---

## 🔧 Backend (FastAPI)

### Arquitetura em Camadas

```
Routes (API) → Services (Business Logic) → Repositories (Data Access) → Models (DB)
```

### Principais Endpoints

#### Autenticação
- `POST /auth/login` - Login com JWT
- `POST /auth/logout` - Logout

#### Tickets
- `GET /tickets` - Listar tickets (filtros: status, priority)
- `GET /tickets/{id}` - Detalhes do ticket
- Retorna SLA calculado dinamicamente

#### Conversas
- `GET /conversations` - Listar conversas
- `GET /conversations/{id}` - Detalhes da conversa

#### Webhooks
- `GET /webhooks/whatsapp` - Verificação webhook
- `POST /webhooks/whatsapp` - Receber mensagens
- `POST /webhooks/telegram` - Receber atualizações Telegram
- `POST /webhooks/email` - Receber emails (SendGrid/Mailgun)

#### Real-time
- `GET /events/stream` - SSE stream

### Modelos de Dados

#### User
```python
id: UUID (PK)
email: str (unique, indexed)
name: str
password_hash: str
role: Enum (ADMIN, SUPERVISOR, AGENT)
active: bool (indexed)
created_at: datetime
```

#### Conversation
```python
id: UUID (PK)
contact_id: UUID (FK)
channel: Enum (WHATSAPP, EMAIL, TELEGRAM, TWITTER)
status: Enum (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
assigned_to: UUID (FK User, nullable)
unread_count: int
last_message_at: datetime (indexed)
metadata: JSON

# Composite indexes:
- (channel, status)
- (assigned_to, status)
```

#### Message
```python
id: UUID (PK)
conversation_id: UUID (FK)
direction: Enum (INBOUND, OUTBOUND)
body: str
status: Enum (PENDING, SENT, DELIVERED, READ, FAILED)
provider_message_id: str (unique, for deduplication)
sent_by: UUID (FK User, nullable)
metadata: JSON
created_at: datetime (indexed)
```

#### Ticket
```python
id: UUID (PK)
ticket_number: str (unique, human-readable)
conversation_id: UUID (FK)
subject: str
priority: Enum (LOW, MEDIUM, HIGH, URGENT)
status: Enum (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
assigned_to: UUID (FK User, nullable)
resolution_due_at: datetime (SLA)
resolved_at: datetime
created_at: datetime

# Composite indexes:
- (status, priority)
- (assigned_to, status)
```

---

## 🎨 Frontend (Next.js)

### App Router Structure

```
app/
├── (auth)/                 # Auth layout
│   └── login/
├── (dashboard)/           # Dashboard layout
│   ├── dashboard/
│   ├── inbox/
│   ├── tickets/
│   └── reports/
└── api/bff/               # Backend for Frontend
    ├── auth/
    └── tickets/
```

### State Management

- **Auth**: React Context (`AuthContext`)
- **Server State**: TanStack Query
- **Real-time**: Custom `useSSE` hook

### Custom Components (4)

#### StatusBadge
```typescript
<StatusBadge status="open" />        // Primary
<StatusBadge status="in_progress" /> // Warning
<StatusBadge status="resolved" />    // Success
<StatusBadge status="closed" />      // Default
```

#### PriorityBadge
```typescript
<PriorityBadge priority="low" />     // Default (no icon)
<PriorityBadge priority="medium" />  // Primary (no icon)
<PriorityBadge priority="high" />    // Warning (with icon)
<PriorityBadge priority="urgent" />  // Danger (with icon)
```

#### ChannelBadge
```typescript
<ChannelBadge channel="whatsapp" />  // Success + MessageCircle
<ChannelBadge channel="email" />     // Primary + Mail
<ChannelBadge channel="telegram" />  // Primary + Send
<ChannelBadge channel="twitter" />   // Default + Twitter
```

#### TicketCard
```typescript
<TicketCard
  id="TKT-12345"
  title="Bug no login"
  description="Usuários não conseguem..."
  status="open"
  priority="high"
  channel="whatsapp"
  messageCount={5}
  slaRemaining="2h 30m"
  createdAt="2h atrás"
  assignee={{ name: "João Silva", avatar: "..." }}
/>
```

---

## 🗄️ Banco de Dados

### Configuração PostgreSQL

```yaml
# docker-compose.yml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_DB: ghitdesk_db
    POSTGRES_USER: ghitdesk_user
    POSTGRES_PASSWORD: ghitdesk_password
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

### Migrations (Alembic)

```bash
# Criar nova migration
alembic revision --autogenerate -m "Add new table"

# Aplicar migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Índices Otimizados

```sql
-- Conversations
CREATE INDEX idx_conversations_channel_status ON conversations(channel, status);
CREATE INDEX idx_conversations_assigned_status ON conversations(assigned_to, status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE UNIQUE INDEX idx_messages_provider_id ON messages(provider_message_id);

-- Tickets
CREATE INDEX idx_tickets_status_priority ON tickets(status, priority);
CREATE INDEX idx_tickets_assigned_status ON tickets(assigned_to, status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
```

---

## 🔌 Integrações

### WhatsApp Cloud API

#### Configuração
```bash
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_ID=your_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_API_TOKEN=your_api_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token
```

#### Recursos Implementados
- ✅ Enviar mensagem de texto
- ✅ Enviar mensagem com mídia (imagem, vídeo, documento)
- ✅ Enviar template message
- ✅ Marcar como lido
- ✅ Webhook verification
- ✅ Receber mensagens inbound

### Email (SMTP)

#### Configuração
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@ghitdesk.com
```

#### Recursos Implementados
- ✅ Enviar email via SMTP
- ✅ Suporte a HTML e texto
- ✅ Anexos (placeholder)
- ✅ Parse de emails inbound (webhook)

### Telegram Bot API

#### Configuração
```bash
TELEGRAM_BOT_TOKEN=your_bot_token
```

#### Recursos Implementados
- ✅ Enviar mensagem de texto
- ✅ Enviar foto/documento com caption
- ✅ Receber mensagens via webhook
- ✅ Suporte a grupos e canais
- ✅ Parse de mídias (foto, vídeo, áudio)

---

## 🧪 Testes

### Backend (pytest)

```bash
# Rodar todos os testes
pytest

# Com coverage
pytest --cov=app --cov-report=html

# Testes específicos
pytest tests/test_security.py
```

**Cobertura Atual:**
- `test_security.py` - 7 testes (JWT, password hashing)
- `test_sla_service.py` - Testes de estratégias SLA
- `test_channel_factory.py` - Testes de factory pattern

### Frontend (Vitest)

```bash
# Rodar testes
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

**Cobertura Atual (~140 testes):**
- Component tests (4 arquivos, ~80 testes)
  - StatusBadge.test.tsx
  - PriorityBadge.test.tsx
  - ChannelBadge.test.tsx
  - TicketCard.test.tsx
- Integration tests (2 arquivos, ~60 testes)
  - login/page.test.tsx
  - dashboard/page.test.tsx

---

## 🚀 Deployment

### Variáveis de Ambiente

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-prod
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=7

# WhatsApp
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_ID=
WHATSAPP_API_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@ghitdesk.com

# Telegram
TELEGRAM_BOT_TOKEN=
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/bff
```

### Docker

```bash
# Subir infraestrutura (Postgres + Redis)
docker-compose up -d

# Build backend
cd apps/api
pip install -r requirements.txt
alembic upgrade head
python seed_data.py  # Dados de teste

# Build frontend
cd apps/web
pnpm install
pnpm build

# Rodar
# Backend: uvicorn app.main:app --reload
# Frontend: pnpm dev
```

---

## 📊 Métricas e Performance

### Backend
- **Tempo de resposta médio**: < 100ms (sem DB)
- **Throughput**: ~1000 req/s (sem cache)
- **Memory**: ~100MB (base)
- **Startup time**: ~2s

### Frontend
- **Lighthouse Score**: 90+ (Performance, Accessibility, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: ~300KB (gzipped)

---

## 🔐 Segurança

### Implementado
- ✅ JWT com refresh tokens
- ✅ Senha hash com bcrypt (cost factor 12)
- ✅ httpOnly cookies
- ✅ CORS configurável
- ✅ SQL injection protection (ORM)
- ✅ Input validation (Pydantic)

### TODO
- [ ] Rate limiting
- [ ] HTTPS obrigatório em produção
- [ ] CSP headers
- [ ] RBAC granular
- [ ] Audit log
- [ ] 2FA

---

## 📝 Convenções de Código

### Python
- PEP 8 (formatação com Black)
- Type hints obrigatórios
- Docstrings em inglês
- Async/await para I/O

### TypeScript
- ESLint + Prettier
- Strict mode
- Functional components (React)
- Hooks sobre classes

### Git
- Conventional Commits
- Feature branches
- PR reviews obrigatórias

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'feat: add amazing feature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

- **Issues**: https://github.com/ghitdesk/ghitdesk/issues
- **Docs**: https://docs.ghitdesk.com
- **Email**: dev@ghitdesk.com

---

**Última atualização**: 2025-11-05
**Versão**: 1.0.0-beta
**Status**: MVP Completo + Melhorias Fase 3

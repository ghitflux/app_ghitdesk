# CLAUDE.md - GhitDesk Development Guide for AI Assistants

**Last Updated:** 2025-11-18
**Project:** GhitDesk MVP - Omnichannel Helpdesk System
**Status:** ✅ MVP Complete and Functional

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture & Tech Stack](#-architecture--tech-stack)
3. [Monorepo Structure](#-monorepo-structure)
4. [Development Workflows](#-development-workflows)
5. [Design Patterns](#-design-patterns-implemented)
6. [Code Conventions](#-code-conventions)
7. [Testing Strategy](#-testing-strategy)
8. [Common Tasks](#-common-tasks)
9. [Troubleshooting](#-troubleshooting)
10. [AI Assistant Guidelines](#-ai-assistant-guidelines)

---

## 🎯 Project Overview

**GhitDesk** is a professional omnichannel helpdesk system with WhatsApp integration, AI capabilities, and real-time features. The project is built as a monorepo using pnpm workspaces.

### Key Features
- ✅ Multi-channel support (WhatsApp, Email, Telegram)
- ✅ Real-time updates via SSE (Server-Sent Events)
- ✅ JWT authentication with refresh tokens
- ✅ SLA tracking and management
- ✅ Complete design system (24 components, 23+ stories)
- ✅ Comprehensive testing (pytest + Vitest)
- ✅ CI/CD with GitHub Actions

### Project Stats
- **Lines of Code:** ~8000+
- **Components:** 24 (HeroUI + custom)
- **Storybook Stories:** 23+
- **API Endpoints:** 12+
- **Database Models:** 5
- **Test Files:** 15+
- **Design Patterns:** 8 implementations

---

## 🏗️ Architecture & Tech Stack

### Frontend (apps/web)
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 18.2.0
- **Design System:** HeroUI 2.4.0
- **Styling:** Tailwind CSS 4.0 (CSS-based config)
- **State Management:** TanStack Query 5.28.0
- **Documentation:** Storybook 10.0.0-beta.13
- **Testing:** Vitest
- **Icons:** lucide-react 0.408.0
- **Type Safety:** TypeScript 5.4.0 (strict mode)

### Backend (apps/api)
- **Framework:** FastAPI 0.115.0
- **Runtime:** Python 3.11
- **Database:** PostgreSQL 16 with SQLAlchemy 2.0.36 (async)
- **Cache:** Redis 7 with hiredis
- **Migrations:** Alembic 1.14.0
- **Authentication:** JWT (python-jose)
- **Password Hashing:** bcrypt 4.2.1
- **Validation:** Pydantic 2.10.4
- **HTTP Client:** httpx 0.28.1
- **Testing:** pytest with pytest-asyncio

### DevOps & Tools
- **Package Manager:** pnpm 8+ (workspaces)
- **Build System:** Turbo 1.10.0
- **Version Management:** Changesets 2.27.0
- **Containers:** Docker + docker-compose
- **CI/CD:** GitHub Actions
- **Database:** PostgreSQL 16-alpine
- **Cache:** Redis 7-alpine

---

## 📁 Monorepo Structure

```
ghitdesk/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline (lint, test, build)
│
├── .claude/                    # Claude Code configurations
├── .changeset/                 # Changesets for version management
│
├── apps/
│   ├── web/                    # Next.js 15 Frontend
│   │   ├── .storybook/         # Storybook configuration
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router pages
│   │   │   │   ├── (auth)/    # Auth route group (login)
│   │   │   │   ├── (dashboard)/ # Dashboard route group (inbox, tickets, reports)
│   │   │   │   ├── api/       # API routes
│   │   │   │   └── demo/      # Demo pages
│   │   │   ├── components/    # React components
│   │   │   │   └── ghitdesk/  # Custom GhitDesk components
│   │   │   │       ├── status-badge.tsx
│   │   │   │       ├── priority-badge.tsx
│   │   │   │       ├── channel-badge.tsx
│   │   │   │       └── ticket-card.tsx
│   │   │   ├── context/       # React Context (AuthContext)
│   │   │   ├── services/      # API Client, SSE Client (Singleton)
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── lib/           # Utilities
│   │   │   ├── stories/       # Storybook stories (23 files)
│   │   │   └── test/          # Frontend tests
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── vitest.config.ts
│   │   └── package.json
│   │
│   └── api/                    # FastAPI Backend
│       ├── app/
│       │   ├── core/           # Config, Security (Singleton)
│       │   │   ├── config.py   # Settings (Singleton)
│       │   │   └── security.py # JWT utilities
│       │   ├── db/             # Database layer
│       │   │   ├── session.py  # DatabaseSessionFactory (Singleton)
│       │   │   └── repositories/ # Repository Pattern
│       │   ├── cache/          # Redis layer
│       │   │   └── client.py   # RedisClient (Singleton)
│       │   ├── models/         # SQLAlchemy models (5 models)
│       │   │   ├── user.py
│       │   │   ├── contact.py
│       │   │   ├── conversation.py
│       │   │   ├── message.py
│       │   │   └── ticket.py
│       │   ├── schemas/        # Pydantic schemas
│       │   ├── services/       # Business logic
│       │   │   ├── auth_service.py
│       │   │   ├── channel_service.py  # Factory Pattern
│       │   │   ├── message_service.py
│       │   │   └── sla_service.py      # Strategy Pattern
│       │   ├── integrations/   # External integrations
│       │   │   ├── whatsapp_client.py  # WhatsAppClient (Singleton)
│       │   │   └── sse_manager.py      # SSEManager (Singleton)
│       │   └── api/
│       │       └── routes/     # FastAPI endpoints
│       ├── migrations/         # Alembic migrations
│       ├── tests/              # Backend tests (pytest)
│       │   ├── test_security.py
│       │   ├── test_sla_service.py
│       │   └── test_channel_factory.py
│       ├── seed_data.py        # Database seeding script
│       ├── alembic.ini
│       ├── requirements.txt
│       └── main.py
│
├── docs/                       # Comprehensive documentation
│   ├── PLANO-GERAL-5-ETAPAS.md
│   ├── ETAPA-1-CONCLUIDA.md    # Foundation (Monorepo + HeroUI)
│   ├── ETAPA-2-CONCLUIDA.md    # Design System (24 components)
│   ├── ETAPA-3-CONCLUIDA.md    # Backend + Auth (FastAPI + JWT)
│   ├── ETAPA-4-CONCLUIDA.md    # MVP Features (WhatsApp + SSE)
│   └── ETAPA-5-CONCLUIDA.md    # Tests + CI/CD
│
├── references/                 # Reference materials
├── docker-compose.yml          # Postgres + Redis services
├── pnpm-workspace.yaml         # Monorepo workspace config
├── turbo.json                  # Turbo build config
├── package.json                # Root package.json
├── .env.example                # Environment variables template
├── CLAUDE.md                   # This file
└── README.md                   # User-facing documentation
```

---

## 🔧 Development Workflows

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/ghitflux/app_ghitdesk.git
cd app_ghitdesk

# 2. Install frontend dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with appropriate values

# 4. Start Docker services (Postgres + Redis)
docker-compose up -d

# 5. Setup backend
cd apps/api
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt

# 6. Run database migrations
alembic upgrade head

# 7. Seed database with test data
python seed_data.py
```

### Daily Development

```bash
# Terminal 1: Run backend (from apps/api/)
python -m app.main
# API runs on http://localhost:8000
# Docs on http://localhost:8000/docs

# Terminal 2: Run frontend (from root)
pnpm dev
# Frontend runs on http://localhost:3000

# Terminal 3: Run Storybook (optional, from root)
pnpm storybook
# Storybook runs on http://localhost:6006
```

### Monorepo Commands

```bash
# Run all dev servers in parallel
pnpm dev

# Build all apps
pnpm build

# Run all tests
pnpm test

# Lint all apps
pnpm lint

# Run Storybook
pnpm storybook

# Filter commands to specific workspace
pnpm --filter web dev        # Run only web dev
pnpm --filter web build      # Build only web
pnpm --filter web test       # Test only web
```

### Database Migrations

```bash
# Create new migration
cd apps/api
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Rollback all migrations
alembic downgrade base

# View current migration
alembic current

# View migration history
alembic history
```

---

## 🎨 Design Patterns Implemented

### 1. Singleton Pattern (6 implementations)

**Purpose:** Ensure single instance of critical resources

**Locations:**
- `apps/api/app/core/config.py` - Config (settings loaded once)
- `apps/api/app/db/session.py` - DatabaseSessionFactory
- `apps/api/app/cache/client.py` - RedisClient
- `apps/api/app/integrations/whatsapp_client.py` - WhatsAppClient
- `apps/api/app/integrations/sse_manager.py` - SSEManager
- `apps/web/src/services/api-client.ts` - APIClient (frontend)

**Example:**
```python
class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            # Initialize once
        return cls._instance
```

### 2. Factory Pattern

**Purpose:** Create channel handlers without modifying existing code (Open/Closed Principle)

**Location:** `apps/api/app/services/channel_service.py`

**Implementation:**
```python
class ChannelFactory:
    @staticmethod
    def create_handler(channel: str):
        if channel == "whatsapp":
            return WhatsAppHandler()
        elif channel == "email":
            return EmailHandler()
        elif channel == "telegram":
            return TelegramHandler()
        # Extensible for new channels
```

### 3. Strategy Pattern (2 implementations)

**Purpose:** Swap algorithms at runtime

**Locations:**
- `apps/api/app/services/sla_service.py` - SLA calculation strategies
  - SimpleSLAStrategy (current MVP)
  - BusinessHoursSLAStrategy (future)
- Message processing strategies (WhatsApp, Email, Telegram)

**Example:**
```python
class SLACalculator:
    def __init__(self, strategy: SLAStrategy):
        self.strategy = strategy

    def calculate(self, ticket):
        return self.strategy.calculate(ticket)
```

### 4. Repository Pattern

**Purpose:** Abstract data access layer

**Location:** `apps/api/app/db/repositories/`

**Repositories:**
- UserRepository
- ConversationRepository
- MessageRepository
- TicketRepository
- ContactRepository

**Example:**
```python
class UserRepository:
    async def get_by_id(self, user_id: int) -> User:
        # Database access logic

    async def create(self, user_data: UserCreate) -> User:
        # Creation logic
```

---

## 📝 Code Conventions

### TypeScript/React (Frontend)

**File naming:**
- Components: `kebab-case.tsx` (e.g., `status-badge.tsx`)
- Stories: `PascalCase.stories.tsx` (e.g., `StatusBadge.stories.tsx`)
- Utils/Services: `kebab-case.ts` (e.g., `api-client.ts`)
- Types: `types.ts` or inline interfaces

**Component structure:**
```typescript
// Use named exports for components
export function StatusBadge({ status }: StatusBadgeProps) {
  // Component logic
}

// Define props with TypeScript interfaces
interface StatusBadgeProps {
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  size?: 'sm' | 'md' | 'lg';
}
```

**Import order:**
1. React/Next.js imports
2. Third-party libraries
3. HeroUI components
4. Local components
5. Utilities/types
6. Styles (if any)

**Styling:**
- Use Tailwind CSS classes
- Use HeroUI components as base
- Custom components in `src/components/ghitdesk/`
- Use `clsx` or `tailwind-merge` for conditional classes

### Python (Backend)

**File naming:**
- All files: `snake_case.py` (e.g., `auth_service.py`)
- Models: Singular (e.g., `user.py`, `ticket.py`)
- Services: `*_service.py` (e.g., `sla_service.py`)

**Code structure:**
```python
# Imports order:
# 1. Standard library
# 2. Third-party packages (FastAPI, SQLAlchemy, etc.)
# 3. Local imports

from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate
from app.db.session import get_db
```

**Async everywhere:**
- All database operations are async
- Use `async def` for route handlers
- Use `await` for database queries

**Type hints:**
- Use type hints for all function parameters and return values
- Use Pydantic models for request/response schemas
- Use SQLAlchemy models for database entities

### Database

**Model naming:**
- Singular names: `User`, `Ticket`, `Conversation`
- Table names: Plural snake_case: `users`, `tickets`, `conversations`

**Relationships:**
- Use `relationship()` for ORM navigation
- Define `back_populates` for bidirectional relationships
- Use indexes on foreign keys and frequently queried fields

---

## 🧪 Testing Strategy

### Backend Tests (pytest)

**Location:** `apps/api/tests/`

**Run tests:**
```bash
cd apps/api
pytest                      # Run all tests
pytest -v                   # Verbose output
pytest --cov=app           # With coverage
pytest tests/test_security.py  # Specific file
```

**Test structure:**
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    response = await client.post("/api/auth/login", json={
        "email": "admin@ghitdesk.com",
        "password": "admin123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

**Existing test files:**
- `test_security.py` - Authentication and JWT tests
- `test_sla_service.py` - SLA calculation tests
- `test_channel_factory.py` - Factory pattern tests

### Frontend Tests (Vitest)

**Location:** `apps/web/src/test/`

**Run tests:**
```bash
cd apps/web
pnpm test              # Run all tests
pnpm test:ui           # Interactive UI
pnpm test:coverage     # With coverage
```

### Storybook (Visual Testing)

**Location:** `apps/web/src/stories/`

**Run Storybook:**
```bash
pnpm storybook         # Dev mode
pnpm storybook:build   # Production build
```

**Story structure:**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from '@/components/ghitdesk/status-badge';

const meta: Meta<typeof StatusBadge> = {
  title: 'GhitDesk/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Open: Story = {
  args: { status: 'open' },
};
```

**Component Coverage (23/46):**
- ✅ 19 HeroUI base components with stories
- ✅ 4 custom GhitDesk components with stories
- ⏳ 23 components pending stories

---

## 🚀 Common Tasks

### Adding a New API Endpoint

1. Create schema in `apps/api/app/schemas/`
2. Add service logic in `apps/api/app/services/`
3. Create route in `apps/api/app/api/routes/`
4. Register route in main router
5. Add tests in `apps/api/tests/`

### Creating a New Component

1. Create component in `apps/web/src/components/ghitdesk/`
2. Use HeroUI components as base
3. Add TypeScript types
4. Create Storybook story in `apps/web/src/stories/`
5. Test in Storybook

### Adding a New Model

1. Create model in `apps/api/app/models/`
2. Create schema in `apps/api/app/schemas/`
3. Generate migration: `alembic revision --autogenerate -m "add model"`
4. Review and edit migration file
5. Apply migration: `alembic upgrade head`
6. Create repository if needed
7. Update seed_data.py if needed

### Implementing a New Channel (Factory Pattern)

1. Create handler class in `apps/api/app/services/channel_service.py`
2. Implement required methods (send_message, receive_message, etc.)
3. Add handler to ChannelFactory
4. Create integration client in `apps/api/app/integrations/`
5. Add webhook endpoint in `apps/api/app/api/routes/`
6. Add tests

### Database Seeding

**File:** `apps/api/seed_data.py`

**Run seeding:**
```bash
cd apps/api
python seed_data.py
```

**Default credentials:**
- Admin: admin@ghitdesk.com / admin123
- Agent 1: joao@ghitdesk.com / agent123
- Agent 2: maria@ghitdesk.com / agent123

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port (Linux/Mac)
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Docker Issues

```bash
# Reset Docker services
docker-compose down -v
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs redis
```

### Database Migration Issues

```bash
# Reset database
cd apps/api
alembic downgrade base
alembic upgrade head
python seed_data.py
```

### Frontend Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Storybook Errors

**Common issue:** Component imports causing loops

**Solution:** Ensure all custom components are properly exported and don't have circular dependencies

---

## 🤖 AI Assistant Guidelines

### When Working on This Codebase

1. **Always check both frontend and backend** when making changes that affect the full stack
2. **Use design patterns** - Don't create ad-hoc solutions when a pattern exists
3. **Write tests** - Add tests for new features (pytest for backend, Vitest for frontend)
4. **Update Storybook** - Create stories for new UI components
5. **Follow conventions** - Stick to naming and code structure conventions
6. **Update migrations** - Always create Alembic migrations for model changes
7. **Check CI/CD** - Ensure changes pass GitHub Actions workflows

### File Location Quick Reference

**Need to modify authentication?**
- Backend: `apps/api/app/core/security.py`
- Frontend: `apps/web/src/context/auth-context.tsx`

**Need to add a new page?**
- Create in: `apps/web/src/app/(dashboard)/new-page/page.tsx`

**Need to modify database models?**
- Models: `apps/api/app/models/`
- Generate migration: `alembic revision --autogenerate -m "description"`

**Need to add API endpoint?**
- Routes: `apps/api/app/api/routes/`
- Schemas: `apps/api/app/schemas/`
- Services: `apps/api/app/services/`

**Need to create a component?**
- Component: `apps/web/src/components/ghitdesk/`
- Story: `apps/web/src/stories/`

**Need to modify real-time features?**
- SSE Manager: `apps/api/app/integrations/sse_manager.py`
- SSE Client: `apps/web/src/services/sse-client.ts`

### Key Environment Variables

```bash
# Backend
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
WHATSAPP_API_TOKEN=your-token

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api/bff
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Architecture Decisions

1. **Why monorepo?** - Shared types, coordinated releases, easier refactoring
2. **Why FastAPI?** - Async support, automatic OpenAPI docs, Pydantic validation
3. **Why Next.js 15?** - App Router, React Server Components, built-in API routes
4. **Why HeroUI?** - Complete design system, dark mode, accessibility
5. **Why Storybook?** - Component documentation, visual testing, design system showcase
6. **Why SSE instead of WebSockets?** - Simpler for one-way server→client updates, HTTP-based
7. **Why Singleton pattern?** - Database connections, config, Redis clients should be reused
8. **Why Repository pattern?** - Abstraction layer, easier testing, cleaner service layer

### Don't Do This

❌ Create duplicate singletons (check existing patterns first)
❌ Add hardcoded values (use environment variables)
❌ Skip migrations (always create and run migrations)
❌ Ignore TypeScript errors (fix them, don't use `@ts-ignore`)
❌ Mix sync and async code in backend (use async throughout)
❌ Create components without types (always use TypeScript interfaces)
❌ Skip tests for new features
❌ Commit without running linter

### Do This

✅ Use existing design patterns
✅ Follow the established folder structure
✅ Write comprehensive commit messages
✅ Add JSDoc/docstrings for complex functions
✅ Use type hints in Python
✅ Use TypeScript interfaces in frontend
✅ Create Storybook stories for new components
✅ Add tests for new features
✅ Update documentation when changing architecture

---

## 📚 Additional Resources

- **Full Documentation:** `/docs/` folder
- **API Documentation:** http://localhost:8000/docs (when backend is running)
- **Storybook:** http://localhost:6006 (when Storybook is running)
- **Main README:** `/README.md`

---

## 🎨 Storybook Component Status

### ✅ Components with Stories (23/46)

**HeroUI Base Components (19):**
1. Avatar
2. Badge
3. Button
4. Card
5. Checkbox
6. Chip
7. Divider
8. Dropdown
9. Input
10. Link
11. Modal
12. Progress
13. Select
14. Skeleton
15. Spinner
16. Switch
17. Table
18. Tabs
19. Tooltip

**Custom GhitDesk Components (4):**
1. StatusBadge (apps/web/src/components/ghitdesk/status-badge.tsx)
2. PriorityBadge (apps/web/src/components/ghitdesk/priority-badge.tsx)
3. ChannelBadge (apps/web/src/components/ghitdesk/channel-badge.tsx)
4. TicketCard (apps/web/src/components/ghitdesk/ticket-card.tsx)

### ⏳ Pending Stories (23 components)

**High Priority:**
- User (used in pages)

**Medium Priority:**
- Accordion, Autocomplete, Breadcrumbs, Drawer, Form, Kbd, Listbox, Menu, Navbar, Pagination, Popover, Radio, Slider

**Low Priority:**
- Alert, Calendar, Code, Date-input, Date-picker, Image, Input-otp, Number-input, Scroll-shadow, Snippet, Spacer, Toast

---

**This document is maintained for AI assistants working on the GhitDesk codebase. Keep it updated when making architectural changes.**

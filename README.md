# GhitDesk

Sistema de Help Desk moderno construído com arquitetura monorepo e design patterns.

## Arquitetura

### Monorepo Structure

```
ghitdesk/
├── apps/
│   ├── api/          # Fastify backend
│   └── web/          # Next.js 15 frontend
├── packages/
│   ├── @ghit/ui/     # Design system
│   ├── @ghit/core/   # Business logic & patterns
│   └── @ghit/config/ # Shared configurations
└── docker/           # Docker configurations
```

### Design Patterns

#### Singleton Pattern
- **DatabaseConnection**: Pool de conexões PostgreSQL
- **CacheManager**: Cliente Redis para cache
- **Logger**: Logger Pino com contexto

#### Factory Pattern
- **EntityFactory**: Factory abstrato para entidades de domínio
- **TicketFactory**: Criação de tickets com validação
- **TaskFactory**: Criação de tarefas
- **ContactFactory**: Criação de contatos

#### Strategy Pattern
- **AuthStrategy**: Interface para estratégias de autenticação
  - JWTAuthStrategy: Autenticação baseada em JWT
  - SessionAuthStrategy: Autenticação baseada em sessão
- **SLAStrategy**: Cálculo de SLA baseado em prioridade
  - HighPrioritySLAStrategy
  - MediumPrioritySLAStrategy
  - LowPrioritySLAStrategy

## Tecnologias

### Backend
- **Fastify**: Framework Node.js de alta performance
- **PostgreSQL 16**: Banco de dados relacional
- **Redis 7**: Cache e gerenciamento de sessões
- **Drizzle ORM**: ORM TypeScript-first
- **Pino**: Logger de alta performance

### Frontend
- **Next.js 15**: Framework React
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

### DevOps
- **Turborepo**: Build system para monorepo
- **pnpm**: Package manager rápido
- **Docker**: Containerização
- **Docker Compose**: Orquestração local

## Setup

### Pré-requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker e Docker Compose

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd ghitdesk
```

2. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

3. Instale as dependências:
```bash
pnpm install
```

4. Inicie os serviços Docker:
```bash
docker-compose up -d
```

5. Verifique o status dos containers:
```bash
docker-compose ps
```

## Desenvolvimento

### Comandos Disponíveis

```bash
# Desenvolvimento (todos os packages)
pnpm dev

# Build (todos os packages)
pnpm build

# Lint
pnpm lint

# Tests
pnpm test

# Typecheck
pnpm typecheck

# Format
pnpm format

# Limpar
pnpm clean
```

### Trabalhar em um package específico

```bash
# Instalar dependência no @ghit/core
pnpm --filter @ghit/core add <package>

# Rodar dev no frontend
pnpm --filter web dev

# Build do backend
pnpm --filter api build
```

## Docker Services

### PostgreSQL
- **Porta**: 5432
- **Database**: ghitdesk
- **User**: ghitdesk
- **Password**: ghitdesk_dev_password

### Redis
- **Porta**: 6379
- **Password**: ghitdesk_redis_password

### Comandos úteis

```bash
# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reiniciar serviços
docker-compose restart
```

## Package @ghit/core

O package `@ghit/core` contém a lógica de negócio e design patterns fundamentais.

### Uso

```typescript
import {
  DatabaseConnection,
  ticketFactory,
  JWTAuthStrategy,
  getSLAStrategy
} from '@ghit/core';

// Singleton - Database
const db = DatabaseConnection.getInstance();
await db.testConnection();

// Factory - Ticket
const ticket = ticketFactory.create({
  title: 'Bug no sistema',
  description: 'Descrição detalhada',
  reporterId: 'user-123',
  priority: TicketPriority.HIGH
});

// Strategy - Auth
const authStrategy = new JWTAuthStrategy({
  secret: process.env.JWT_SECRET,
  expiresIn: '7d'
});

// Strategy - SLA
const slaStrategy = getSLAStrategy(ticket.priority);
const deadlines = slaStrategy.calculateDeadlines(new Date(), ticket.priority);
```

## Próximos Passos

Aguardando o PROMPT 2 para continuar a construção do projeto.

## Licença

MIT

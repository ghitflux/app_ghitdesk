# @ghit/core

Core business logic and design patterns for GhitDesk.

## Architecture Patterns

### Singleton Pattern
- **DatabaseConnection**: PostgreSQL connection pool singleton
- **CacheManager**: Redis client singleton
- **Logger**: Pino logger instance singleton with context

### Factory Pattern
- **EntityFactory**: Abstract factory for domain entities
- **TicketFactory**: Creates ticket instances
- **TaskFactory**: Creates task instances
- **ContactFactory**: Creates contact instances

### Strategy Pattern
- **AuthStrategy**: Authentication strategy interface
  - JWTAuthStrategy
  - SessionAuthStrategy
- **SLAStrategy**: SLA priority strategies (high/medium/low)

## Usage

```typescript
import { DatabaseConnection, TicketFactory, JWTAuthStrategy } from '@ghit/core';

// Singleton usage
const db = DatabaseConnection.getInstance();

// Factory usage
const ticket = TicketFactory.create({ title: 'Issue', priority: 'high' });

// Strategy usage
const authStrategy = new JWTAuthStrategy();
```

# GhitDesk API

Fastify-based REST API with Better Auth, SLA management, and real-time features.

## Architecture

### Design Patterns Applied

#### Singleton Pattern
- **BetterAuthService**: Centralized authentication management
- **SocketService**: WebSocket server for real-time communication
- **DatabaseConnection** (from @ghit/core): PostgreSQL connection pool
- **Logger** (from @ghit/core): Structured logging with Pino

#### Factory Pattern
- **TicketFactory** (from @ghit/core): Creates tickets with validation
- **TaskFactory** (from @ghit/core): Creates tasks
- **ContactFactory** (from @ghit/core): Creates contacts

#### Strategy Pattern
- **SLAStrategy** (from @ghit/core): Calculates SLA based on priority
  - High Priority: 15min first response, 4h resolution
  - Medium Priority: 1h first response, 24h resolution
  - Low Priority: 4h first response, 72h resolution

### Tech Stack

- **Fastify**: High-performance web framework
- **Better Auth**: Modern authentication library
- **Drizzle ORM**: TypeScript-first ORM
- **PostgreSQL**: Database
- **Redis**: Cache and sessions
- **Socket.IO**: Real-time communication
- **Zod**: Schema validation
- **Swagger**: API documentation

## Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker and Docker Compose (for database)

### Installation

1. Ensure Docker containers are running:
```bash
# From project root
docker-compose up -d
```

2. Install dependencies:
```bash
# From project root
pnpm install
```

3. Create `.env` file:
```bash
cp apps/api/.env.example apps/api/.env
```

4. Generate and run migrations:
```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
```

5. Start development server:
```bash
pnpm dev
```

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Build
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate migrations from schema
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript compiler check
pnpm clean            # Remove build artifacts
```

## API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: [http://localhost:3001/docs](http://localhost:3001/docs)
- **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### Tickets
- `GET /api/tickets` - List tickets (with filters)
- `POST /api/tickets` - Create ticket (with SLA calculation)
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/tickets/:id/assign` - Assign ticket
- `POST /api/tickets/:id/status` - Update status
- `GET /api/tickets/:id/sla` - Check SLA status
- `GET /api/tickets/sla/breached` - Get SLA breached tickets

## Example: Creating a Ticket with SLA

```bash
curl -X POST http://localhost:3001/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "System not responding",
    "description": "The main application is not loading",
    "priority": "high",
    "reporterId": "user-uuid"
  }'
```

Response:
```json
{
  "id": "ticket-uuid",
  "title": "System not responding",
  "description": "The main application is not loading",
  "status": "open",
  "priority": "high",
  "slaDueAt": "2025-10-19T18:00:00Z",  // Automatically calculated!
  "createdAt": "2025-10-19T14:00:00Z",
  "updatedAt": "2025-10-19T14:00:00Z"
}
```

## WebSocket Events

Connect to Socket.IO for real-time updates:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

// Listen to ticket events
socket.on('ticket:created', (ticket) => {
  console.log('New ticket:', ticket);
});

socket.on('ticket:updated', (ticket) => {
  console.log('Ticket updated:', ticket);
});

socket.on('sla:breach_warning', (ticket) => {
  console.log('SLA breach warning:', ticket);
});

// Join room for specific ticket
socket.emit('join_room', `ticket:${ticketId}`);
```

## Database Schema

### Main Tables

- **users**: User accounts and authentication
- **sessions**: Active user sessions
- **tickets**: Support tickets with SLA tracking
- **tasks**: Tasks linked to tickets
- **contacts**: Customer/contact information
- **comments**: Comments on tickets/tasks

### SLA Fields

Tickets include automatic SLA tracking:
- `slaDueAt`: Resolution deadline (calculated on creation)
- `firstResponseAt`: Timestamp of first response
- `resolvedAt`: Resolution timestamp
- `closedAt`: Closure timestamp

## Project Structure

```
apps/api/
├── src/
│   ├── server.ts                        # Main server (Singleton)
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── schema.ts                # Drizzle schemas
│   │   │   ├── connection.ts            # DB connection
│   │   │   └── migrations/              # Generated migrations
│   │   ├── auth/
│   │   │   ├── BetterAuthService.ts     # Auth Singleton
│   │   │   └── strategies/              # JWT & Session strategies
│   │   └── realtime/
│   │       └── SocketService.ts         # WebSocket Singleton
│   ├── domain/
│   │   ├── tickets/
│   │   │   ├── TicketRepository.ts      # Data access
│   │   │   ├── TicketService.ts         # Business logic + Factory
│   │   │   └── TicketController.ts      # HTTP handlers
│   │   ├── tasks/
│   │   └── contacts/
│   └── shared/
│       ├── decorators/                  # @Timing, @Cache
│       └── middleware/                  # Auth, Error, Logger
├── drizzle.config.ts                    # Drizzle Kit config
└── package.json
```

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT signing
- `BETTER_AUTH_SECRET`: Better Auth secret
- `API_PORT`: Server port (default: 3001)

## Troubleshooting

### Database Connection Issues

If migrations fail:
```bash
# Recreate database
docker-compose down -v
docker-compose up -d

# Wait for database to be ready
sleep 5

# Run migrations again
pnpm db:migrate
```

### Port Already in Use

Change the API_PORT in `.env`:
```env
API_PORT=3002
```

## Next Steps

This API is ready for:
- Task and Contact domain implementations (similar to Tickets)
- Additional WebSocket events
- Testing with the frontend (Next.js app)
- Deployment configuration

See the project root README for more information about the complete monorepo.

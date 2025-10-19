import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TicketService, CreateTicketDTO, UpdateTicketDTO } from './TicketService';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

/**
 * Ticket Controller
 * Handles HTTP requests for ticket operations
 */
export class TicketController {
  constructor(private service: TicketService) {}

  /**
   * Register all ticket routes
   */
  async registerRoutes(fastify: FastifyInstance) {
    // Create ticket
    fastify.post(
      '/tickets',
      {
        schema: {
          tags: ['Tickets'],
          description: 'Create a new ticket with SLA calculation',
          body: zodToJsonSchema(CreateTicketDTO),
          response: {
            201: {
              description: 'Ticket created successfully',
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                status: { type: 'string' },
                priority: { type: 'string' },
                slaDueAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const ticket = await this.service.create(request.body as any);
        return reply.code(201).send(ticket);
      }
    );

    // Get all tickets
    fastify.get(
      '/tickets',
      {
        schema: {
          tags: ['Tickets'],
          description: 'Get all tickets with optional filters',
          querystring: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['open', 'in_progress', 'pending', 'resolved', 'closed'] },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
              assigneeId: { type: 'string', format: 'uuid' },
              reporterId: { type: 'string', format: 'uuid' },
              limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
              offset: { type: 'integer', minimum: 0, default: 0 },
              orderBy: { type: 'string', enum: ['createdAt', 'updatedAt', 'priority'], default: 'createdAt' },
              order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            },
          },
          response: {
            200: {
              description: 'List of tickets',
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                },
              },
            },
          },
        },
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const filters = request.query as any;
        const tickets = await this.service.getAll(filters);
        return reply.send(tickets);
      }
    );

    // Get ticket by ID
    fastify.get(
      '/tickets/:id',
      {
        schema: {
          tags: ['Tickets'],
          description: 'Get ticket by ID',
          params: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', format: 'uuid' },
            },
          },
          response: {
            200: {
              description: 'Ticket details',
              type: 'object',
            },
            404: {
              description: 'Ticket not found',
              type: 'object',
              properties: {
                error: { type: 'string' },
              },
            },
          },
        },
      },
      async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const ticket = await this.service.getById(request.params.id);

        if (!ticket) {
          return reply.code(404).send({ error: 'Ticket not found' });
        }

        return reply.send(ticket);
      }
    );

    // Update ticket
    fastify.patch(
      '/tickets/:id',
      {
        schema: {
          tags: ['Tickets'],
          description: 'Update ticket',
          params: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', format: 'uuid' },
            },
          },
          body: zodToJsonSchema(UpdateTicketDTO),
          response: {
            200: {
              description: 'Ticket updated successfully',
              type: 'object',
            },
            404: {
              description: 'Ticket not found',
              type: 'object',
              properties: {
                error: { type: 'string' },
              },
            },
          },
        },
      },
      async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const ticket = await this.service.update(request.params.id, request.body as any);

        if (!ticket) {
          return reply.code(404).send({ error: 'Ticket not found' });
        }

        return reply.send(ticket);
      }
    );

    // Delete ticket
    fastify.delete(
      '/tickets/:id',
      {
        schema: {
          tags: ['Tickets'],
          description: 'Delete ticket',
          params: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', format: 'uuid' },
            },
          },
          response: {
            204: {
              description: 'Ticket deleted successfully',
              type: 'null',
            },
            404: {
              description: 'Ticket not found',
              type: 'object',
              properties: {
                error: { type: 'string' },
              },
            },
          },
        },
      },
      async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const deleted = await this.service.delete(request.params.id);

        if (!deleted) {
          return reply.code(404).send({ error: 'Ticket not found' });
        }

        return reply.code(204).send();
      }
    );

    // Assign ticket
    fastify.post(
      '/tickets/:id/assign',
      {
        schema: {
          tags: ['Tickets'],
          description: 'Assign ticket to user',
          params: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', format: 'uuid' },
            },
          },
          body: {
            type: 'object',
            required: ['assigneeId'],
            properties: {
              assigneeId: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
      async (request: FastifyRequest<{ Params: { id: string }; Body: { assigneeId: string } }>, reply: FastifyReply) => {
        const ticket = await this.service.assign(request.params.id, request.body.assigneeId);

        if (!ticket) {
          return reply.code(404).send({ error: 'Ticket not found' });
        }

        return reply.send(ticket);
      }
    );

    // Update status
    fastify.post(
      '/tickets/:id/status',
      {
        schema: {
          tags: ['Tickets'],
          description: 'Update ticket status',
          params: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', format: 'uuid' },
            },
          },
          body: {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string', enum: ['open', 'in_progress', 'pending', 'resolved', 'closed'] },
            },
          },
        },
      },
      async (request: FastifyRequest<{ Params: { id: string }; Body: { status: string } }>, reply: FastifyReply) => {
        const ticket = await this.service.updateStatus(request.params.id, request.body.status);

        if (!ticket) {
          return reply.code(404).send({ error: 'Ticket not found' });
        }

        return reply.send(ticket);
      }
    );

    // Check SLA
    fastify.get(
      '/tickets/:id/sla',
      {
        schema: {
          tags: ['Tickets'],
          description: 'Check SLA status for a ticket',
          params: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', format: 'uuid' },
            },
          },
          response: {
            200: {
              description: 'SLA status',
              type: 'object',
              properties: {
                breached: { type: 'boolean' },
                remainingMinutes: { type: 'number' },
                deadline: { type: 'string', format: 'date-time', nullable: true },
              },
            },
          },
        },
      },
      async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const slaStatus = await this.service.checkSLA(request.params.id);
        return reply.send(slaStatus);
      }
    );

    // Get SLA breached tickets
    fastify.get(
      '/tickets/sla/breached',
      {
        schema: {
          tags: ['Tickets'],
          description: 'Get all tickets with SLA breach',
          response: {
            200: {
              description: 'List of SLA breached tickets',
              type: 'array',
            },
          },
        },
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const tickets = await this.service.getSLABreached();
        return reply.send(tickets);
      }
    );
  }
}

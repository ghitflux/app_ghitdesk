import { TicketRepository } from './TicketRepository';
import { TicketPriority, getSLAStrategy, Logger } from '@ghit/core';
import type { NewTicket, Ticket } from '../../infrastructure/database/schema';
import { z } from 'zod';

/**
 * Ticket creation DTO
 */
export const CreateTicketDTO = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  reporterId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketDTO>;

/**
 * Ticket update DTO
 */
export const UpdateTicketDTO = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['open', 'in_progress', 'pending', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type UpdateTicketInput = z.infer<typeof UpdateTicketDTO>;

/**
 * Service layer for Ticket business logic
 * Uses Factory pattern and SLA Strategy
 */
export class TicketService {
  private repository: TicketRepository;
  private logger = Logger.getInstance();

  constructor(repository: TicketRepository) {
    this.repository = repository;
  }

  /**
   * Create a new ticket with SLA calculation
   * Uses Factory pattern and SLA Strategy
   */
  async create(input: CreateTicketInput): Promise<Ticket> {
    try {
      // Validate input
      const validated = CreateTicketDTO.parse(input);

      this.logger.debug({ input: validated }, 'Creating ticket with SLA calculation');

      // Map priority string to enum
      const priority = this.mapPriority(validated.priority);

      // Get SLA strategy based on priority
      const slaStrategy = getSLAStrategy(priority);

      // Calculate SLA deadlines
      const createdAt = new Date();
      const slaResult = slaStrategy.calculateDeadlines(createdAt, priority);

      this.logger.debug(
        {
          priority: validated.priority,
          firstResponseDeadline: slaResult.firstResponseDeadline,
          resolutionDeadline: slaResult.resolutionDeadline,
        },
        'SLA deadlines calculated'
      );

      // Create ticket with SLA
      const newTicket: NewTicket = {
        title: validated.title,
        description: validated.description,
        status: 'open',
        priority: validated.priority as any,
        reporterId: validated.reporterId,
        assigneeId: validated.assigneeId,
        contactId: validated.contactId,
        tags: validated.tags || [],
        metadata: validated.metadata || {},
        slaDueAt: slaResult.resolutionDeadline,
        createdAt,
        updatedAt: createdAt,
      };

      const ticket = await this.repository.create(newTicket);

      this.logger.info({ ticketId: ticket.id, priority: ticket.priority }, 'Ticket created with SLA');

      return ticket;
    } catch (error) {
      this.logger.error({ error, input }, 'Failed to create ticket');
      throw error;
    }
  }

  /**
   * Get ticket by ID
   */
  async getById(id: string): Promise<Ticket | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      this.logger.error({ error, id }, 'Failed to get ticket');
      throw error;
    }
  }

  /**
   * Get all tickets with filters
   */
  async getAll(filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    reporterId?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'priority';
    order?: 'asc' | 'desc';
  }): Promise<Ticket[]> {
    try {
      return await this.repository.findAll(filters);
    } catch (error) {
      this.logger.error({ error, filters }, 'Failed to get tickets');
      throw error;
    }
  }

  /**
   * Update ticket
   */
  async update(id: string, input: UpdateTicketInput): Promise<Ticket | null> {
    try {
      const validated = UpdateTicketDTO.parse(input);

      // If priority changed, recalculate SLA
      let updates: Partial<NewTicket> = { ...validated } as any;

      if (validated.priority) {
        const ticket = await this.repository.findById(id);
        if (ticket) {
          const priority = this.mapPriority(validated.priority);
          const slaStrategy = getSLAStrategy(priority);
          const slaResult = slaStrategy.calculateDeadlines(ticket.createdAt, priority);
          updates.slaDueAt = slaResult.resolutionDeadline;

          this.logger.debug({ ticketId: id, newPriority: validated.priority }, 'SLA recalculated due to priority change');
        }
      }

      return await this.repository.update(id, updates);
    } catch (error) {
      this.logger.error({ error, id, input }, 'Failed to update ticket');
      throw error;
    }
  }

  /**
   * Delete ticket
   */
  async delete(id: string): Promise<boolean> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      this.logger.error({ error, id }, 'Failed to delete ticket');
      throw error;
    }
  }

  /**
   * Assign ticket to user
   */
  async assign(ticketId: string, assigneeId: string): Promise<Ticket | null> {
    try {
      this.logger.info({ ticketId, assigneeId }, 'Assigning ticket');
      return await this.repository.assign(ticketId, assigneeId);
    } catch (error) {
      this.logger.error({ error, ticketId, assigneeId }, 'Failed to assign ticket');
      throw error;
    }
  }

  /**
   * Update ticket status
   */
  async updateStatus(ticketId: string, status: string): Promise<Ticket | null> {
    try {
      this.logger.info({ ticketId, status }, 'Updating ticket status');

      const additionalUpdates: Partial<NewTicket> = {};

      // Set first response timestamp if moving from 'open'
      const ticket = await this.repository.findById(ticketId);
      if (ticket && ticket.status === 'open' && !ticket.firstResponseAt) {
        additionalUpdates.firstResponseAt = new Date();
      }

      return await this.repository.updateStatus(ticketId, status, additionalUpdates);
    } catch (error) {
      this.logger.error({ error, ticketId, status }, 'Failed to update ticket status');
      throw error;
    }
  }

  /**
   * Get tickets with SLA breach
   */
  async getSLABreached(): Promise<Ticket[]> {
    try {
      return await this.repository.findSLABreached();
    } catch (error) {
      this.logger.error({ error }, 'Failed to get SLA breached tickets');
      throw error;
    }
  }

  /**
   * Check SLA status for a ticket
   */
  async checkSLA(ticketId: string): Promise<{
    breached: boolean;
    remainingMinutes: number;
    deadline: Date | null;
  }> {
    try {
      const ticket = await this.repository.findById(ticketId);

      if (!ticket || !ticket.slaDueAt) {
        return {
          breached: false,
          remainingMinutes: 0,
          deadline: null,
        };
      }

      const priority = this.mapPriority(ticket.priority);
      const slaStrategy = getSLAStrategy(priority);

      const remainingMinutes = slaStrategy.getRemainingMinutes(ticket.slaDueAt);
      const breached = remainingMinutes < 0;

      return {
        breached,
        remainingMinutes,
        deadline: ticket.slaDueAt,
      };
    } catch (error) {
      this.logger.error({ error, ticketId }, 'Failed to check SLA');
      throw error;
    }
  }

  /**
   * Map priority string to TicketPriority enum
   */
  private mapPriority(priority: string): TicketPriority {
    switch (priority) {
      case 'low':
        return TicketPriority.LOW;
      case 'medium':
        return TicketPriority.MEDIUM;
      case 'high':
        return TicketPriority.HIGH;
      case 'urgent':
        return TicketPriority.URGENT;
      default:
        return TicketPriority.MEDIUM;
    }
  }
}

// Export singleton instance
export const ticketService = new TicketService(new TicketRepository());

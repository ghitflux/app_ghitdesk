import { z } from 'zod';
import { EntityFactory, BaseEntity } from './EntityFactory';

/**
 * Ticket status enum
 */
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

/**
 * Ticket priority enum
 */
export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Ticket entity interface
 */
export interface Ticket extends BaseEntity {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  reporterId: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Ticket creation input schema
 */
const ticketInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  status: z.nativeEnum(TicketStatus).default(TicketStatus.OPEN),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
  assigneeId: z.string().uuid().optional(),
  reporterId: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Ticket input type
 */
export type TicketInput = z.infer<typeof ticketInputSchema>;

/**
 * Factory for creating Ticket entities
 */
export class TicketFactory extends EntityFactory<TicketInput, Ticket> {
  protected schema = ticketInputSchema;

  protected createEntity(validated: TicketInput): Ticket {
    const now = this.now();
    return {
      id: this.generateId(),
      title: validated.title,
      description: validated.description,
      status: validated.status,
      priority: validated.priority,
      assigneeId: validated.assigneeId,
      reporterId: validated.reporterId,
      tags: validated.tags || [],
      metadata: validated.metadata || {},
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Create a high-priority ticket
   */
  public createUrgent(input: Omit<TicketInput, 'priority'>): Ticket {
    return this.create({
      ...input,
      priority: TicketPriority.URGENT,
    });
  }

  /**
   * Create a ticket with specific status
   */
  public createWithStatus(input: Omit<TicketInput, 'status'>, status: TicketStatus): Ticket {
    return this.create({
      ...input,
      status,
    });
  }
}

// Export a singleton instance for convenience
export const ticketFactory = new TicketFactory();

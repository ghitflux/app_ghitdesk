import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '../../infrastructure/database/connection';
import { tickets, type Ticket, type NewTicket } from '../../infrastructure/database/schema';
import { Logger } from '@ghit/core';

/**
 * Repository pattern for Ticket entity
 * Handles all database operations for tickets
 */
export class TicketRepository {
  private logger = Logger.getInstance();

  /**
   * Create a new ticket
   */
  async create(ticket: NewTicket): Promise<Ticket> {
    try {
      this.logger.debug({ ticket }, 'Creating new ticket');

      const [created] = await db.insert(tickets).values(ticket).returning();

      this.logger.info({ ticketId: created.id }, 'Ticket created successfully');
      return created;
    } catch (error) {
      this.logger.error({ error, ticket }, 'Failed to create ticket');
      throw error;
    }
  }

  /**
   * Find ticket by ID
   */
  async findById(id: string): Promise<Ticket | null> {
    try {
      const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);

      return ticket || null;
    } catch (error) {
      this.logger.error({ error, id }, 'Failed to find ticket by ID');
      throw error;
    }
  }

  /**
   * Find all tickets with optional filters
   */
  async findAll(filters?: {
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
      let query = db.select().from(tickets);

      // Apply filters
      const conditions = [];
      if (filters?.status) {
        conditions.push(eq(tickets.status, filters.status as any));
      }
      if (filters?.priority) {
        conditions.push(eq(tickets.priority, filters.priority as any));
      }
      if (filters?.assigneeId) {
        conditions.push(eq(tickets.assigneeId, filters.assigneeId));
      }
      if (filters?.reporterId) {
        conditions.push(eq(tickets.reporterId, filters.reporterId));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      // Apply ordering
      const orderByColumn = filters?.orderBy || 'createdAt';
      const orderDirection = filters?.order || 'desc';
      const orderFn = orderDirection === 'asc' ? asc : desc;

      query = query.orderBy(orderFn(tickets[orderByColumn])) as any;

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit) as any;
      }
      if (filters?.offset) {
        query = query.offset(filters.offset) as any;
      }

      const result = await query;
      return result;
    } catch (error) {
      this.logger.error({ error, filters }, 'Failed to find tickets');
      throw error;
    }
  }

  /**
   * Update ticket
   */
  async update(id: string, updates: Partial<NewTicket>): Promise<Ticket | null> {
    try {
      this.logger.debug({ id, updates }, 'Updating ticket');

      const [updated] = await db
        .update(tickets)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(tickets.id, id))
        .returning();

      if (updated) {
        this.logger.info({ ticketId: id }, 'Ticket updated successfully');
      }

      return updated || null;
    } catch (error) {
      this.logger.error({ error, id, updates }, 'Failed to update ticket');
      throw error;
    }
  }

  /**
   * Delete ticket
   */
  async delete(id: string): Promise<boolean> {
    try {
      this.logger.debug({ id }, 'Deleting ticket');

      const result = await db.delete(tickets).where(eq(tickets.id, id)).returning();

      const deleted = result.length > 0;
      if (deleted) {
        this.logger.info({ ticketId: id }, 'Ticket deleted successfully');
      }

      return deleted;
    } catch (error) {
      this.logger.error({ error, id }, 'Failed to delete ticket');
      throw error;
    }
  }

  /**
   * Count tickets with optional filters
   */
  async count(filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    reporterId?: string;
  }): Promise<number> {
    try {
      let query = db.select({ count: sql<number>`count(*)` }).from(tickets);

      const conditions = [];
      if (filters?.status) {
        conditions.push(eq(tickets.status, filters.status as any));
      }
      if (filters?.priority) {
        conditions.push(eq(tickets.priority, filters.priority as any));
      }
      if (filters?.assigneeId) {
        conditions.push(eq(tickets.assigneeId, filters.assigneeId));
      }
      if (filters?.reporterId) {
        conditions.push(eq(tickets.reporterId, filters.reporterId));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const [result] = await query;
      return result?.count || 0;
    } catch (error) {
      this.logger.error({ error, filters }, 'Failed to count tickets');
      throw error;
    }
  }

  /**
   * Find tickets with SLA breach
   */
  async findSLABreached(): Promise<Ticket[]> {
    try {
      const now = new Date();

      const result = await db
        .select()
        .from(tickets)
        .where(
          and(
            sql`${tickets.slaDueAt} < ${now}`,
            sql`${tickets.status} != 'resolved' AND ${tickets.status} != 'closed'`
          )
        )
        .orderBy(asc(tickets.slaDueAt));

      return result;
    } catch (error) {
      this.logger.error({ error }, 'Failed to find SLA breached tickets');
      throw error;
    }
  }

  /**
   * Assign ticket to user
   */
  async assign(ticketId: string, assigneeId: string): Promise<Ticket | null> {
    return this.update(ticketId, { assigneeId });
  }

  /**
   * Update ticket status
   */
  async updateStatus(ticketId: string, status: string, additionalUpdates?: Partial<NewTicket>): Promise<Ticket | null> {
    const updates: Partial<NewTicket> = { status: status as any, ...additionalUpdates };

    // Set timestamps based on status
    if (status === 'resolved') {
      updates.resolvedAt = new Date();
    } else if (status === 'closed') {
      updates.closedAt = new Date();
    }

    return this.update(ticketId, updates);
  }
}

// Export singleton instance
export const ticketRepository = new TicketRepository();

import { RESTStrategy } from '../strategies/RESTStrategy';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  reporterId: string;
  contactId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  slaDueAt?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reporterId: string;
  assigneeId?: string;
  contactId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  contactId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'priority';
  order?: 'asc' | 'desc';
}

/**
 * Ticket Repository
 * Handles all ticket-related API operations
 */
export class TicketRepository {
  private strategy: RESTStrategy;
  private resource = '/tickets';

  constructor() {
    this.strategy = new RESTStrategy();
  }

  /**
   * Get all tickets
   */
  async getAll(filters?: TicketFilters): Promise<Ticket[]> {
    return this.strategy.fetch<Ticket[]>(this.resource, filters);
  }

  /**
   * Get ticket by ID
   */
  async getById(id: string): Promise<Ticket> {
    return this.strategy.fetch<Ticket>(`${this.resource}/${id}`);
  }

  /**
   * Create new ticket
   */
  async create(data: CreateTicketInput): Promise<Ticket> {
    return this.strategy.create<Ticket>(this.resource, data);
  }

  /**
   * Update ticket
   */
  async update(id: string, data: UpdateTicketInput): Promise<Ticket> {
    return this.strategy.patch<Ticket>(this.resource, id, data);
  }

  /**
   * Delete ticket
   */
  async delete(id: string): Promise<void> {
    return this.strategy.delete<void>(this.resource, id);
  }

  /**
   * Assign ticket to user
   */
  async assign(ticketId: string, assigneeId: string): Promise<Ticket> {
    return this.strategy.create<Ticket>(`${this.resource}/${ticketId}/assign`, { assigneeId });
  }

  /**
   * Update ticket status
   */
  async updateStatus(ticketId: string, status: string): Promise<Ticket> {
    return this.strategy.create<Ticket>(`${this.resource}/${ticketId}/status`, { status });
  }

  /**
   * Check SLA status
   */
  async checkSLA(ticketId: string): Promise<{
    breached: boolean;
    remainingMinutes: number;
    deadline: string | null;
  }> {
    return this.strategy.fetch(`${this.resource}/${ticketId}/sla`);
  }

  /**
   * Get SLA breached tickets
   */
  async getSLABreached(): Promise<Ticket[]> {
    return this.strategy.fetch<Ticket[]>(`${this.resource}/sla/breached`);
  }
}

// Export singleton instance
export const ticketRepository = new TicketRepository();

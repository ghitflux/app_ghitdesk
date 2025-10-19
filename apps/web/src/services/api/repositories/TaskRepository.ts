import { RESTStrategy } from '../strategies/RESTStrategy';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  ticketId?: string;
  dueDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: string;
  ticketId?: string;
  dueDate?: string;
  estimatedHours?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: string;
  ticketId?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  ticketId?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'dueDate';
  order?: 'asc' | 'desc';
}

/**
 * Task Repository
 * Handles all task-related API operations
 */
export class TaskRepository {
  private strategy: RESTStrategy;
  private resource = '/tasks';

  constructor() {
    this.strategy = new RESTStrategy();
  }

  /**
   * Get all tasks
   */
  async getAll(filters?: TaskFilters): Promise<Task[]> {
    return this.strategy.fetch<Task[]>(this.resource, filters);
  }

  /**
   * Get task by ID
   */
  async getById(id: string): Promise<Task> {
    return this.strategy.fetch<Task>(`${this.resource}/${id}`);
  }

  /**
   * Create new task
   */
  async create(data: CreateTaskInput): Promise<Task> {
    return this.strategy.create<Task>(this.resource, data);
  }

  /**
   * Update task
   */
  async update(id: string, data: UpdateTaskInput): Promise<Task> {
    return this.strategy.patch<Task>(this.resource, id, data);
  }

  /**
   * Delete task
   */
  async delete(id: string): Promise<void> {
    return this.strategy.delete<void>(this.resource, id);
  }

  /**
   * Get tasks by ticket
   */
  async getByTicket(ticketId: string): Promise<Task[]> {
    return this.strategy.fetch<Task[]>(this.resource, { ticketId });
  }

  /**
   * Get tasks by assignee
   */
  async getByAssignee(assigneeId: string): Promise<Task[]> {
    return this.strategy.fetch<Task[]>(this.resource, { assigneeId });
  }

  /**
   * Mark task as complete
   */
  async complete(taskId: string): Promise<Task> {
    return this.update(taskId, {
      status: 'done',
      actualHours: 0, // This should be calculated or provided
    });
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();

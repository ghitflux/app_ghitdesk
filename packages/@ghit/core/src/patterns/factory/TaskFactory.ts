import { z } from 'zod';
import { EntityFactory, BaseEntity } from './EntityFactory';

/**
 * Task status enum
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

/**
 * Task priority enum
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Task entity interface
 */
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  ticketId?: string;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
}

/**
 * Task creation input schema
 */
const taskInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assigneeId: z.string().uuid().optional(),
  ticketId: z.string().uuid().optional(),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.number().positive().optional(),
});

/**
 * Task input type
 */
export type TaskInput = z.infer<typeof taskInputSchema>;

/**
 * Factory for creating Task entities
 */
export class TaskFactory extends EntityFactory<TaskInput, Task> {
  protected schema = taskInputSchema;

  protected createEntity(validated: TaskInput): Task {
    const now = this.now();
    return {
      id: this.generateId(),
      title: validated.title,
      description: validated.description,
      status: validated.status,
      priority: validated.priority,
      assigneeId: validated.assigneeId,
      ticketId: validated.ticketId,
      dueDate: validated.dueDate,
      estimatedHours: validated.estimatedHours,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Create a task linked to a ticket
   */
  public createForTicket(input: Omit<TaskInput, 'ticketId'>, ticketId: string): Task {
    return this.create({
      ...input,
      ticketId,
    });
  }

  /**
   * Create a task with a due date
   */
  public createWithDeadline(input: Omit<TaskInput, 'dueDate'>, dueDate: Date): Task {
    return this.create({
      ...input,
      dueDate,
    });
  }

  /**
   * Create a task and assign it immediately
   */
  public createAndAssign(input: Omit<TaskInput, 'assigneeId'>, assigneeId: string): Task {
    return this.create({
      ...input,
      assigneeId,
    });
  }

  /**
   * Mark a task as completed
   */
  public markComplete(task: Task): Task {
    const now = this.now();
    return {
      ...task,
      status: TaskStatus.DONE,
      completedAt: now,
      updatedAt: now,
    };
  }
}

// Export a singleton instance for convenience
export const taskFactory = new TaskFactory();

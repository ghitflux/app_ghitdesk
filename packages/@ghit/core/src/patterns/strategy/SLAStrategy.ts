import { TicketPriority } from '../factory/TicketFactory';

/**
 * SLA time targets interface
 */
export interface SLATargets {
  firstResponseMinutes: number; // Time to first response
  resolutionHours: number; // Time to resolution
  escalationMinutes?: number; // Time before escalation
}

/**
 * SLA breach information
 */
export interface SLABreach {
  breached: boolean;
  breachType?: 'first_response' | 'resolution' | 'escalation';
  breachTime?: Date;
  overdueMinutes?: number;
}

/**
 * SLA calculation result
 */
export interface SLAResult {
  priority: TicketPriority;
  targets: SLATargets;
  firstResponseDeadline: Date;
  resolutionDeadline: Date;
  escalationDeadline?: Date;
  isBusinessHours: boolean;
}

/**
 * Business hours configuration
 */
export interface BusinessHoursConfig {
  enabled: boolean;
  startHour: number; // 0-23
  endHour: number; // 0-23
  weekendDays: number[]; // 0=Sunday, 6=Saturday
  holidays?: Date[];
}

/**
 * Strategy Pattern for SLA (Service Level Agreement) calculations
 * Defines different SLA strategies based on ticket priority
 */
export abstract class SLAStrategy {
  /**
   * Strategy name/identifier
   */
  abstract readonly name: string;

  /**
   * SLA targets for this strategy
   */
  abstract readonly targets: SLATargets;

  /**
   * Business hours configuration
   */
  protected businessHours: BusinessHoursConfig = {
    enabled: true,
    startHour: 9,
    endHour: 17,
    weekendDays: [0, 6], // Sunday and Saturday
  };

  /**
   * Calculate SLA deadlines for a ticket
   * @param createdAt Ticket creation time
   * @param priority Ticket priority
   * @returns SLA calculation result
   */
  calculateDeadlines(createdAt: Date, priority: TicketPriority): SLAResult {
    const firstResponseDeadline = this.addMinutes(createdAt, this.targets.firstResponseMinutes);
    const resolutionDeadline = this.addHours(createdAt, this.targets.resolutionHours);
    const escalationDeadline = this.targets.escalationMinutes
      ? this.addMinutes(createdAt, this.targets.escalationMinutes)
      : undefined;

    return {
      priority,
      targets: this.targets,
      firstResponseDeadline,
      resolutionDeadline,
      escalationDeadline,
      isBusinessHours: this.isBusinessHours(createdAt),
    };
  }

  /**
   * Check if SLA has been breached
   * @param createdAt Ticket creation time
   * @param firstResponseAt Time of first response (optional)
   * @param resolvedAt Time of resolution (optional)
   * @returns Breach information
   */
  checkBreach(createdAt: Date, firstResponseAt?: Date, resolvedAt?: Date): SLABreach {
    const now = new Date();
    const deadlines = this.calculateDeadlines(createdAt, TicketPriority.MEDIUM);

    // Check first response breach
    if (!firstResponseAt && now > deadlines.firstResponseDeadline) {
      return {
        breached: true,
        breachType: 'first_response',
        breachTime: deadlines.firstResponseDeadline,
        overdueMinutes: this.getMinutesDifference(deadlines.firstResponseDeadline, now),
      };
    }

    // Check resolution breach
    if (!resolvedAt && now > deadlines.resolutionDeadline) {
      return {
        breached: true,
        breachType: 'resolution',
        breachTime: deadlines.resolutionDeadline,
        overdueMinutes: this.getMinutesDifference(deadlines.resolutionDeadline, now),
      };
    }

    // Check escalation breach
    if (deadlines.escalationDeadline && !resolvedAt && now > deadlines.escalationDeadline) {
      return {
        breached: true,
        breachType: 'escalation',
        breachTime: deadlines.escalationDeadline,
        overdueMinutes: this.getMinutesDifference(deadlines.escalationDeadline, now),
      };
    }

    return { breached: false };
  }

  /**
   * Get remaining time until deadline
   * @param deadline Deadline time
   * @returns Remaining minutes (negative if overdue)
   */
  getRemainingMinutes(deadline: Date): number {
    const now = new Date();
    return this.getMinutesDifference(now, deadline);
  }

  /**
   * Check if current time is within business hours
   */
  isBusinessHours(date: Date = new Date()): boolean {
    if (!this.businessHours.enabled) {
      return true;
    }

    const hour = date.getHours();
    const day = date.getDay();

    // Check weekend
    if (this.businessHours.weekendDays.includes(day)) {
      return false;
    }

    // Check business hours
    if (hour < this.businessHours.startHour || hour >= this.businessHours.endHour) {
      return false;
    }

    // Check holidays
    if (this.businessHours.holidays) {
      const dateStr = date.toISOString().split('T')[0];
      const isHoliday = this.businessHours.holidays.some(
        (holiday) => holiday.toISOString().split('T')[0] === dateStr
      );
      if (isHoliday) {
        return false;
      }
    }

    return true;
  }

  /**
   * Set business hours configuration
   */
  setBusinessHours(config: Partial<BusinessHoursConfig>): void {
    this.businessHours = { ...this.businessHours, ...config };
  }

  /**
   * Add minutes to a date (considering business hours if enabled)
   */
  protected addMinutes(date: Date, minutes: number): Date {
    if (!this.businessHours.enabled) {
      return new Date(date.getTime() + minutes * 60000);
    }

    // Calculate with business hours consideration
    let current = new Date(date);
    let remainingMinutes = minutes;

    while (remainingMinutes > 0) {
      if (this.isBusinessHours(current)) {
        current = new Date(current.getTime() + 60000); // Add 1 minute
        remainingMinutes--;
      } else {
        // Skip to next business hour
        current = this.getNextBusinessHour(current);
      }
    }

    return current;
  }

  /**
   * Add hours to a date (considering business hours if enabled)
   */
  protected addHours(date: Date, hours: number): Date {
    return this.addMinutes(date, hours * 60);
  }

  /**
   * Get next business hour start time
   */
  protected getNextBusinessHour(date: Date): Date {
    const next = new Date(date);
    const hour = next.getHours();
    const day = next.getDay();

    // If after business hours, go to next day's start
    if (hour >= this.businessHours.endHour) {
      next.setDate(next.getDate() + 1);
      next.setHours(this.businessHours.startHour, 0, 0, 0);
    }
    // If before business hours, go to today's start
    else if (hour < this.businessHours.startHour) {
      next.setHours(this.businessHours.startHour, 0, 0, 0);
    }

    // Skip weekends
    while (this.businessHours.weekendDays.includes(next.getDay())) {
      next.setDate(next.getDate() + 1);
      next.setHours(this.businessHours.startHour, 0, 0, 0);
    }

    return next;
  }

  /**
   * Get difference between two dates in minutes
   */
  protected getMinutesDifference(from: Date, to: Date): number {
    return Math.floor((to.getTime() - from.getTime()) / 60000);
  }
}

/**
 * High Priority SLA Strategy (Urgent tickets)
 * - First response: 15 minutes
 * - Resolution: 4 hours
 * - Escalation: 30 minutes
 */
export class HighPrioritySLAStrategy extends SLAStrategy {
  readonly name = 'high_priority';
  readonly targets: SLATargets = {
    firstResponseMinutes: 15,
    resolutionHours: 4,
    escalationMinutes: 30,
  };
}

/**
 * Medium Priority SLA Strategy
 * - First response: 1 hour
 * - Resolution: 24 hours
 * - Escalation: 4 hours
 */
export class MediumPrioritySLAStrategy extends SLAStrategy {
  readonly name = 'medium_priority';
  readonly targets: SLATargets = {
    firstResponseMinutes: 60,
    resolutionHours: 24,
    escalationMinutes: 240,
  };
}

/**
 * Low Priority SLA Strategy
 * - First response: 4 hours
 * - Resolution: 72 hours
 * - No escalation
 */
export class LowPrioritySLAStrategy extends SLAStrategy {
  readonly name = 'low_priority';
  readonly targets: SLATargets = {
    firstResponseMinutes: 240,
    resolutionHours: 72,
  };
}

/**
 * Factory function to get appropriate SLA strategy based on priority
 */
export function getSLAStrategy(priority: TicketPriority): SLAStrategy {
  switch (priority) {
    case TicketPriority.URGENT:
    case TicketPriority.HIGH:
      return new HighPrioritySLAStrategy();
    case TicketPriority.MEDIUM:
      return new MediumPrioritySLAStrategy();
    case TicketPriority.LOW:
      return new LowPrioritySLAStrategy();
    default:
      return new MediumPrioritySLAStrategy();
  }
}

/**
 * Factory Pattern Exports
 *
 * These classes follow the Factory Method pattern to create domain entities
 * with validation and type safety.
 */

export { EntityFactory, BaseEntity, FactoryInput, FactoryEntity } from './EntityFactory';

export {
  TicketFactory,
  ticketFactory,
  Ticket,
  TicketInput,
  TicketStatus,
  TicketPriority,
} from './TicketFactory';

export {
  TaskFactory,
  taskFactory,
  Task,
  TaskInput,
  TaskStatus,
  TaskPriority,
} from './TaskFactory';

export {
  ContactFactory,
  contactFactory,
  Contact,
  ContactInput,
  ContactType,
  ContactStatus,
} from './ContactFactory';

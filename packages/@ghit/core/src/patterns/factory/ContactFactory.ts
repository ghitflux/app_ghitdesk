import { z } from 'zod';
import { EntityFactory, BaseEntity } from './EntityFactory';

/**
 * Contact type enum
 */
export enum ContactType {
  CUSTOMER = 'customer',
  LEAD = 'lead',
  PARTNER = 'partner',
  VENDOR = 'vendor',
}

/**
 * Contact status enum
 */
export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

/**
 * Contact entity interface
 */
export interface Contact extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  type: ContactType;
  status: ContactStatus;
  company?: string;
  jobTitle?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  tags?: string[];
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Contact creation input schema
 */
const contactInputSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  type: z.nativeEnum(ContactType).default(ContactType.CUSTOMER),
  status: z.nativeEnum(ContactStatus).default(ContactStatus.ACTIVE),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Contact input type
 */
export type ContactInput = z.infer<typeof contactInputSchema>;

/**
 * Factory for creating Contact entities
 */
export class ContactFactory extends EntityFactory<ContactInput, Contact> {
  protected schema = contactInputSchema;

  protected createEntity(validated: ContactInput): Contact {
    const now = this.now();
    return {
      id: this.generateId(),
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      type: validated.type,
      status: validated.status,
      company: validated.company,
      jobTitle: validated.jobTitle,
      address: validated.address,
      tags: validated.tags || [],
      notes: validated.notes,
      metadata: validated.metadata || {},
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Create a customer contact
   */
  public createCustomer(input: Omit<ContactInput, 'type'>): Contact {
    return this.create({
      ...input,
      type: ContactType.CUSTOMER,
    });
  }

  /**
   * Create a lead contact
   */
  public createLead(input: Omit<ContactInput, 'type'>): Contact {
    return this.create({
      ...input,
      type: ContactType.LEAD,
    });
  }

  /**
   * Create a contact with full address
   */
  public createWithAddress(
    input: Omit<ContactInput, 'address'>,
    address: NonNullable<ContactInput['address']>
  ): Contact {
    return this.create({
      ...input,
      address,
    });
  }

  /**
   * Block a contact
   */
  public block(contact: Contact, reason?: string): Contact {
    const now = this.now();
    return {
      ...contact,
      status: ContactStatus.BLOCKED,
      notes: reason ? `${contact.notes || ''}\n[BLOCKED] ${reason}` : contact.notes,
      updatedAt: now,
    };
  }

  /**
   * Activate a contact
   */
  public activate(contact: Contact): Contact {
    const now = this.now();
    return {
      ...contact,
      status: ContactStatus.ACTIVE,
      updatedAt: now,
    };
  }
}

// Export a singleton instance for convenience
export const contactFactory = new ContactFactory();

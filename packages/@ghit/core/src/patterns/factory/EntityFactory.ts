import { z } from 'zod';

/**
 * Base interface for all entities
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Abstract Factory Pattern for creating domain entities
 * Provides a common interface for entity creation with validation
 */
export abstract class EntityFactory<TInput, TEntity extends BaseEntity> {
  /**
   * Zod schema for input validation
   */
  protected abstract schema: z.ZodSchema<TInput>;

  /**
   * Create an entity from input data
   * @param input Raw input data
   * @returns Validated and created entity
   */
  public create(input: TInput): TEntity {
    // Validate input using Zod schema
    const validated = this.schema.parse(input);

    // Call the factory method to create the entity
    return this.createEntity(validated);
  }

  /**
   * Create multiple entities from an array of input data
   * @param inputs Array of raw input data
   * @returns Array of validated and created entities
   */
  public createMany(inputs: TInput[]): TEntity[] {
    return inputs.map((input) => this.create(input));
  }

  /**
   * Validate input without creating an entity
   * @param input Raw input data
   * @returns Validation result
   */
  public validate(input: TInput): { success: boolean; data?: TInput; errors?: z.ZodError } {
    const result = this.schema.safeParse(input);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
  }

  /**
   * Factory method to be implemented by concrete factories
   * @param validated Validated input data
   * @returns Created entity
   */
  protected abstract createEntity(validated: TInput): TEntity;

  /**
   * Generate a unique ID for the entity
   * Override this method for custom ID generation
   */
  protected generateId(): string {
    // Simple UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Get current timestamp
   */
  protected now(): Date {
    return new Date();
  }
}

/**
 * Type helper to extract the input type from a factory
 */
export type FactoryInput<T> = T extends EntityFactory<infer U, any> ? U : never;

/**
 * Type helper to extract the entity type from a factory
 */
export type FactoryEntity<T> = T extends EntityFactory<any, infer U> ? U : never;

import React from 'react';

/**
 * Component Factory Pattern
 * Creates different variants of components based on type
 */

export interface ComponentVariant<P = any> {
  render(props: P): React.ReactElement;
}

export abstract class ComponentFactory<TType extends string, TProps> {
  protected variants: Map<TType, ComponentVariant<TProps>> = new Map();

  /**
   * Register a component variant
   */
  register(type: TType, variant: ComponentVariant<TProps>): void {
    this.variants.set(type, variant);
  }

  /**
   * Create a component of the specified type
   */
  create(type: TType, props: TProps): React.ReactElement {
    const variant = this.variants.get(type);

    if (!variant) {
      throw new Error(`Component variant "${type}" not found`);
    }

    return variant.render(props);
  }

  /**
   * Check if a variant is registered
   */
  has(type: TType): boolean {
    return this.variants.has(type);
  }
}

/**
 * Example usage:
 *
 * const cardFactory = new CardFactory();
 * cardFactory.register('kanban', new KanbanCardVariant());
 * cardFactory.register('list', new ListCardVariant());
 *
 * const card = cardFactory.create('kanban', { title: 'Test' });
 */

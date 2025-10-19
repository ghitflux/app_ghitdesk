/**
 * Singleton Pattern Exports
 *
 * These classes follow the Singleton pattern to ensure only one instance
 * exists throughout the application lifecycle.
 */

export { DatabaseConnection, getDatabase } from './DatabaseConnection';
export { CacheManager, getCache } from './CacheManager';
export { Logger, getLogger } from './Logger';

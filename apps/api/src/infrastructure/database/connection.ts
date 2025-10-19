import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseConnection } from '@ghit/core';
import * as schema from './schema';

/**
 * Get Drizzle ORM instance using the singleton DatabaseConnection
 */
export function getDrizzle() {
  const dbConnection = DatabaseConnection.getInstance();
  const pool = dbConnection.getPool();
  return drizzle(pool, { schema });
}

/**
 * Export singleton database connection
 */
export const db = getDrizzle();

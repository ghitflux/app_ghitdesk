import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema.ts',
  out: './src/infrastructure/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://ghitdesk:ghitdesk_dev_password@localhost:5432/ghitdesk',
  },
  verbose: true,
  strict: true,
});

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Fix for date handling - ensure dates are properly converted to PostgreSQL format
export const client = postgres(process.env.POSTGRES_URL, {
  transform: {
    // Convert JS Date to a string in ISO format that PostgreSQL understands
    date: (date) => date.toISOString(),
  }
});

export const db = drizzle(client, { schema });

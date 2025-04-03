import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

dotenv.config();

// Database configuration options
const DB_CONFIG = {
  max: 10, // Maximum number of connections
  idle_timeout: 30, // Connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
  debug: process.env.NODE_ENV === 'development', // Debug mode for development
  transform: {
    value: {
      // Transform Date objects to ISO strings for PostgreSQL
      from: (value: unknown) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      },
    },
  },
};

// Database connection with error handling
function createDatabaseConnection() {
  if (!process.env.POSTGRES_URL) {
    console.error("POSTGRES_URL environment variable is not set");
    console.warn("Using fallback database settings - this is not recommended for production");
    return postgres("postgres://postgres:postgres@localhost:54323/postgres", DB_CONFIG);
  }

  try {
    return postgres(process.env.POSTGRES_URL, DB_CONFIG);
  } catch (error) {
    console.error("Failed to initialize database connection", error);
    throw error;
  }
}

// Export the client and database connection
export const client = createDatabaseConnection();
export const db = drizzle(client, { schema });

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await client`SELECT 1 as connection_test`;
    return result[0].connection_test === 1;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
}

// Register process exit handlers to close database connections
process.on('exit', () => {
  client.end({ timeout: 5 }).catch(err => {
    console.error('Error closing database connection during exit:', err);
  });
});

process.on('SIGINT', () => {
  console.log('Closing database connections before exit...');
  client.end({ timeout: 5 }).catch(err => {
    console.error('Error closing database connection during SIGINT:', err);
  });
  process.exit(0);
});

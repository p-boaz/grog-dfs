import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

export const client = postgres(process.env.POSTGRES_URL, {
  transform: {
    value: {
      from: (value: unknown) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      },
    },
  },
});

export const db = drizzle(client, { schema });

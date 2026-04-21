import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { loadRootEnv } from "./load-env";

const { Pool } = pg;

loadRootEnv();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on("error", (err) => {
  // Prevent unhandled 'error' events from crashing the Node process.
  // Transient DNS/network failures should not take down the API server.
  console.error("[db] Pool error:", err);
});

export const db = drizzle(pool, { schema });

export * from "./schema";

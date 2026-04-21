import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

console.log("Testing database connection with:", DATABASE_URL.replace(/:[^:]*@/, ":***@"));

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool);

export async function testConnection() {
  try {
    console.log("Attempting to connect...");
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test');
    console.log("Connection successful! Result:", result.rows);
    client.release();
    await pool.end();
  } catch (error) {
    console.error("Connection failed:", error);
    await pool.end();
    process.exit(1);
  }
}

const isDirectRun = (() => {
  try {
    const scriptPath = process.argv[1];
    if (!scriptPath) return false;
    return import.meta.url === new URL(`file://${scriptPath}`).href;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  testConnection();
}

import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  connectionString: env.databaseUrl
});

export async function testDbConnection() {
  const result = await pool.query("SELECT NOW() AS current_time");
  console.log("Database connected:", result.rows[0].current_time);
}
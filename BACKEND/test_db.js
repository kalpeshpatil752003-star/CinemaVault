import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

console.log("Testing connection string:", process.env.DATABASE_URL);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT 1")
  .then(() => {
    console.log("✅ Connection successful!");
    process.exit(0);
  })
  .catch(e => {
    console.error("❌ Connection failed!");
    console.error("FULL ERROR DETAILS:");
    console.error(e);
    process.exit(1);
  });

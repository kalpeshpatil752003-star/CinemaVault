import pg from "pg";
const { Pool } = pg;

const passwords = ["postgres", "password", "admin", "root", "1234", "12345", "123456", ""];
const user = "postgres";
const db = "cinemavault";

async function tryPassword(pwd) {
  const url = `postgresql://${user}:${pwd}@localhost:5432/${db}`;
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query("SELECT 1");
    console.log(`FOUND_CREDENTIALS=${url}`);
    process.exit(0);
  } catch (e) {
    if (e.code === '3D000') {
      console.log(`FOUND_CREDENTIALS_DB_MISSING=${url}`);
      process.exit(0);
    }
    // ignore
  } finally {
    await pool.end();
  }
}

async function run() {
  for (const pwd of passwords) {
    await tryPassword(pwd);
  }
  console.log("NOT_FOUND");
  process.exit(1);
}

run();

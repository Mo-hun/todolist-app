const fs = require("fs");
const path = require("path");

if (!process.env.ENV_FILE) {
  process.env.ENV_FILE = ".env.test";
}

const { pool } = require("../src/config/db");

const migrationsDir = path.resolve(__dirname, "migrations");

async function ensureSchemaMigrations(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function resetSchema(client) {
  await client.query("DROP SCHEMA IF EXISTS public CASCADE");
  await client.query("CREATE SCHEMA public");
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await client.query("GRANT ALL ON SCHEMA public TO CURRENT_USER");
  await client.query("GRANT ALL ON SCHEMA public TO public");
}

async function applyMigrations(client) {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  await ensureSchemaMigrations(client);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await client.query(sql);
    await client.query(
      "INSERT INTO schema_migrations (filename) VALUES ($1)",
      [file]
    );
  }
}

async function resetTestDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await resetSchema(client);
    await applyMigrations(client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function truncateTables() {
  await pool.query("TRUNCATE TABLE todos, categories, users CASCADE");
}

async function closePool() {
  await pool.end();
}

async function run() {
  await resetTestDatabase();
  console.log("Test database reset completed.");
}

if (require.main === module) {
  run().catch(async (error) => {
    console.error("Test database reset failed:", error.message);
    await closePool().catch(() => {});
    process.exit(1);
  });
}

module.exports = {
  pool,
  resetTestDatabase,
  truncateTables,
  closePool,
};

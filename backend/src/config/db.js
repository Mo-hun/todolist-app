const { Pool } = require("pg");
const env = require("./env");

const connectionString =
  env.POSTGRES_CONNECTION_STRING ||
  env.DATABASE_URL ||
  `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

const pool = new Pool({
  connectionString,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

async function checkConnection() {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    console.log(`DB connected: ${result.rows[0].now.toISOString()}`);
    return result.rows[0];
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  checkConnection()
    .then(() => pool.end())
    .catch(async () => {
      await pool.end().catch(() => {});
      process.exit(1);
    });
}

module.exports = {
  pool,
  checkConnection,
};

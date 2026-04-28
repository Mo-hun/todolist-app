const path = require("path");
const dotenv = require("dotenv");

const envFilePath = process.env.ENV_FILE
  ? path.resolve(process.cwd(), process.env.ENV_FILE)
  : path.resolve(__dirname, "../../.env");

dotenv.config({
  path: envFilePath,
  override: true,
});

const env = {
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_NAME: process.env.DB_NAME || "todolist_dev",
  DB_USER: process.env.DB_USER || "todolist_user",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  PORT: Number(process.env.PORT || 3000),
  BCRYPT_COST: Number(process.env.BCRYPT_COST || 12),
};

module.exports = env;

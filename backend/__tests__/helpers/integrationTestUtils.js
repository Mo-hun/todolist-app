process.env.ENV_FILE = ".env.test";

const request = require("supertest");
const app = require("../../src/app");
const {
  pool,
  resetTestDatabase,
  truncateTables,
  closePool,
} = require("../../db/testSetup");

async function registerUser({
  email,
  password = "Password123!",
} = {}) {
  return request(app)
    .post("/api/v1/auth/register")
    .send({ email, password });
}

async function loginUser({
  email,
  password = "Password123!",
} = {}) {
  return request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });
}

async function createUserAndLogin({
  email,
  password = "Password123!",
} = {}) {
  await registerUser({ email, password });
  const loginResponse = await loginUser({ email, password });
  return {
    token: loginResponse.body.data.token,
    user: loginResponse.body.data.user,
    password,
  };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT id, email FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

async function findCategoriesByUserId(userId) {
  const result = await pool.query(
    "SELECT id, user_id, name FROM categories WHERE user_id = $1 ORDER BY created_at ASC",
    [userId]
  );
  return result.rows;
}

async function findTodoById(todoId) {
  const result = await pool.query(
    "SELECT id, user_id, category_id, title, description, due_date, is_completed FROM todos WHERE id = $1",
    [todoId]
  );
  return result.rows[0] || null;
}

async function countTodosByUserId(userId) {
  const result = await pool.query(
    "SELECT COUNT(*)::int AS count FROM todos WHERE user_id = $1",
    [userId]
  );
  return result.rows[0].count;
}

module.exports = {
  app,
  pool,
  request,
  resetTestDatabase,
  truncateTables,
  closePool,
  registerUser,
  loginUser,
  createUserAndLogin,
  authHeader,
  findUserByEmail,
  findCategoriesByUserId,
  findTodoById,
  countTodosByUserId,
};

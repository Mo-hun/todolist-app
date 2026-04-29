const { pool } = require('../config/db');

async function findAllByUserId(userId) {
  const result = await pool.query(
    'SELECT id, user_id, name, created_at FROM categories WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, user_id, name, created_at FROM categories WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create({ userId, name }) {
  const result = await pool.query(
    'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING id, user_id, name, created_at',
    [userId, name]
  );
  return result.rows[0];
}

async function update(id, { name }) {
  const result = await pool.query(
    'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, user_id, name, created_at',
    [name, id]
  );
  return result.rows[0];
}

async function deleteById(id) {
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
}

module.exports = { findAllByUserId, findById, create, update, deleteById };

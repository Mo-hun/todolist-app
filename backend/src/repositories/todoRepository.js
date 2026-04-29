const { pool } = require('../config/db');

async function findAllByUserId(userId, { categoryId, status, sortBy = 'created_at', order = 'desc', page = 1, limit = 20 } = {}) {
  const params = [userId];
  const conditions = ['user_id = $1'];

  if (categoryId !== undefined) {
    if (categoryId === null) {
      conditions.push('category_id IS NULL');
    } else {
      params.push(categoryId);
      conditions.push(`category_id = $${params.length}`);
    }
  }

  if (status === 'completed') {
    conditions.push('is_completed = true');
  } else if (status === 'in_progress') {
    conditions.push('is_completed = false');
    conditions.push('(due_date IS NULL OR due_date >= NOW())');
  } else if (status === 'overdue') {
    conditions.push('is_completed = false');
    conditions.push('due_date < NOW()');
  }

  const allowedSortBy = ['created_at', 'updated_at', 'due_date'];
  const allowedOrder = ['asc', 'desc'];
  const safeSort = allowedSortBy.includes(sortBy) ? sortBy : 'created_at';
  const safeOrder = allowedOrder.includes(String(order).toLowerCase()) ? String(order).toUpperCase() : 'DESC';

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  const whereClause = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM todos WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const dataParams = [...params, limitNum, offset];
  const dataResult = await pool.query(
    `SELECT id, user_id, category_id, title, description, due_date, is_completed, created_at, updated_at
     FROM todos
     WHERE ${whereClause}
     ORDER BY ${safeSort} ${safeOrder}
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );

  return { rows: dataResult.rows, total };
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, user_id, category_id, title, description, due_date, is_completed, created_at, updated_at FROM todos WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create({ userId, title, description = null, dueDate = null, categoryId = null }) {
  const result = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, description, due_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, category_id, title, description, due_date, is_completed, created_at, updated_at`,
    [userId, categoryId, title, description, dueDate]
  );
  return result.rows[0];
}

async function update(id, fields) {
  const setClauses = [];
  const params = [];

  if (fields.title !== undefined) {
    params.push(fields.title);
    setClauses.push(`title = $${params.length}`);
  }
  if (fields.description !== undefined) {
    params.push(fields.description);
    setClauses.push(`description = $${params.length}`);
  }
  if (fields.dueDate !== undefined) {
    params.push(fields.dueDate);
    setClauses.push(`due_date = $${params.length}`);
  }
  if (fields.categoryId !== undefined) {
    params.push(fields.categoryId);
    setClauses.push(`category_id = $${params.length}`);
  }

  setClauses.push('updated_at = NOW()');
  params.push(id);

  const result = await pool.query(
    `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $${params.length}
     RETURNING id, user_id, category_id, title, description, due_date, is_completed, created_at, updated_at`,
    params
  );
  return result.rows[0];
}

async function deleteById(id) {
  await pool.query('DELETE FROM todos WHERE id = $1', [id]);
}

async function toggleComplete(id) {
  const result = await pool.query(
    `UPDATE todos SET is_completed = NOT is_completed, updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, category_id, title, description, due_date, is_completed, created_at, updated_at`,
    [id]
  );
  return result.rows[0];
}

module.exports = { findAllByUserId, findById, create, update, deleteById, toggleComplete };

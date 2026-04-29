const todoRepository = require('../repositories/todoRepository');
const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');
const { HTTP_STATUS, ERROR_CODE } = require('../utils/constants');

function computeTodoFields(todo) {
  const now = new Date();
  const due = todo.due_date ? new Date(todo.due_date) : null;
  const isOverdue = !todo.is_completed && due !== null && due < now;
  const isDueSoon = !todo.is_completed && due !== null && due >= now && (due - now) <= 24 * 60 * 60 * 1000;
  let status;
  if (todo.is_completed) {
    status = 'completed';
  } else if (isOverdue) {
    status = 'overdue';
  } else {
    status = 'in_progress';
  }
  return { ...todo, is_overdue: isOverdue, is_due_soon: isDueSoon, status };
}

async function verifyOwnership(todoId, userId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError('할일을 찾을 수 없습니다.', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
  }
  if (todo.user_id !== userId) {
    throw new AppError('접근 권한이 없습니다.', HTTP_STATUS.FORBIDDEN, ERROR_CODE.FORBIDDEN);
  }
  return todo;
}

async function validateCategoryOwnership(categoryId, userId) {
  if (categoryId === null || categoryId === undefined) {
    return;
  }

  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw new AppError('카테고리를 찾을 수 없습니다.', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
  }

  if (category.user_id !== userId) {
    throw new AppError('접근 권한이 없습니다.', HTTP_STATUS.FORBIDDEN, ERROR_CODE.FORBIDDEN);
  }
}

async function getTodos(userId, filters = {}) {
  const { rows, total } = await todoRepository.findAllByUserId(userId, filters);
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  return {
    todos: rows.map(computeTodoFields),
    pagination: { page, limit, total },
  };
}

async function createTodo(userId, { title, description, dueDate, categoryId }) {
  await validateCategoryOwnership(categoryId, userId);
  const todo = await todoRepository.create({ userId, title, description, dueDate, categoryId });
  return computeTodoFields(todo);
}

async function getTodoById(userId, todoId) {
  const todo = await verifyOwnership(todoId, userId);
  return computeTodoFields(todo);
}

async function updateTodo(userId, todoId, fields) {
  await verifyOwnership(todoId, userId);
  if (Object.prototype.hasOwnProperty.call(fields, 'categoryId')) {
    await validateCategoryOwnership(fields.categoryId, userId);
  }
  const todo = await todoRepository.update(todoId, fields);
  return computeTodoFields(todo);
}

async function deleteTodo(userId, todoId) {
  await verifyOwnership(todoId, userId);
  await todoRepository.deleteById(todoId);
}

async function toggleComplete(userId, todoId) {
  await verifyOwnership(todoId, userId);
  const todo = await todoRepository.toggleComplete(todoId);
  return computeTodoFields(todo);
}

const completeTodo = toggleComplete;

module.exports = { getTodos, createTodo, getTodoById, updateTodo, deleteTodo, toggleComplete, completeTodo };

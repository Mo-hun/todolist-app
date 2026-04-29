const todoService = require('../services/todoService');
const { sendSuccess } = require('../utils/responseHelper');
const { HTTP_STATUS, ERROR_CODE } = require('../utils/constants');
const AppError = require('../utils/AppError');

function normalizeNullable(value) {
  return value === '' ? null : value;
}

async function getTodos(req, res, next) {
  const { category_id, status, sort_by, order, page, limit } = req.query;

  const validStatus = ['in_progress', 'completed', 'overdue'];
  if (status && !validStatus.includes(status)) {
    return next(new AppError('유효하지 않은 status 값입니다.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
  }

  let finalCategoryId = category_id;
  if (category_id === '') finalCategoryId = undefined;
  else if (category_id === 'null') finalCategoryId = null;

  const filters = {
    categoryId: finalCategoryId,
    status,
    sortBy: sort_by || 'created_at',
    order: order || 'desc',
    page: page ? Math.max(1, parseInt(page, 10)) : 1,
    limit: limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20,
  };

  const result = await todoService.getTodos(req.user.id, filters);
  return res.status(200).json({ success: true, data: result.todos, pagination: result.pagination });
}

async function createTodo(req, res, next) {
  const { title, description, due_date, category_id } = req.body || {};
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new AppError('제목을 입력해주세요.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
  }
  const todo = await todoService.createTodo(req.user.id, {
    title: title.trim(),
    description: normalizeNullable(description) ?? null,
    dueDate: normalizeNullable(due_date) ?? null,
    categoryId: normalizeNullable(category_id) ?? null,
  });
  return sendSuccess(res, todo, HTTP_STATUS.CREATED);
}

async function getTodoById(req, res, next) {
  const todo = await todoService.getTodoById(req.user.id, req.params.id);
  return sendSuccess(res, todo);
}

async function updateTodo(req, res, next) {
  const { title, description, due_date, category_id } = req.body || {};
  const fields = {};
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return next(new AppError('제목이 비어있을 수 없습니다.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
    }
    fields.title = title.trim();
  }
  if (description !== undefined) fields.description = normalizeNullable(description);
  if (due_date !== undefined) fields.dueDate = normalizeNullable(due_date);
  if (category_id !== undefined) fields.categoryId = normalizeNullable(category_id);

  const todo = await todoService.updateTodo(req.user.id, req.params.id, fields);
  return sendSuccess(res, todo);
}

async function deleteTodo(req, res, next) {
  await todoService.deleteTodo(req.user.id, req.params.id);
  return sendSuccess(res, { message: '할일이 삭제되었습니다.' });
}

async function toggleComplete(req, res, next) {
  const todo = await todoService.toggleComplete(req.user.id, req.params.id);
  return sendSuccess(res, todo);
}

const completeTodo = toggleComplete;

module.exports = { getTodos, createTodo, getTodoById, updateTodo, deleteTodo, toggleComplete, completeTodo };

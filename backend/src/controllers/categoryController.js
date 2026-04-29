const categoryService = require('../services/categoryService');
const { sendSuccess } = require('../utils/responseHelper');
const { HTTP_STATUS, ERROR_CODE } = require('../utils/constants');
const AppError = require('../utils/AppError');

async function getCategories(req, res, next) {
  const categories = await categoryService.getCategories(req.user.id);
  return sendSuccess(res, categories);
}

async function createCategory(req, res, next) {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError('카테고리 이름을 입력해주세요.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
  }
  const category = await categoryService.createCategory(req.user.id, { name: name.trim() });
  return sendSuccess(res, category, HTTP_STATUS.CREATED);
}

async function updateCategory(req, res, next) {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError('카테고리 이름을 입력해주세요.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
  }
  const category = await categoryService.updateCategory(req.user.id, req.params.id, { name: name.trim() });
  return sendSuccess(res, category);
}

async function deleteCategory(req, res, next) {
  await categoryService.deleteCategory(req.user.id, req.params.id);
  return sendSuccess(res, { message: '카테고리가 삭제되었습니다.' });
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

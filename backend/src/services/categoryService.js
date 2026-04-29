const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');
const { HTTP_STATUS, ERROR_CODE } = require('../utils/constants');

async function getCategories(userId) {
  return categoryRepository.findAllByUserId(userId);
}

async function createCategory(userId, { name }) {
  return categoryRepository.create({ userId, name });
}

async function updateCategory(userId, categoryId, { name }) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new AppError('카테고리를 찾을 수 없습니다.', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
  }
  if (category.user_id !== userId) {
    throw new AppError('접근 권한이 없습니다.', HTTP_STATUS.FORBIDDEN, ERROR_CODE.FORBIDDEN);
  }
  return categoryRepository.update(categoryId, { name });
}

async function deleteCategory(userId, categoryId) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new AppError('카테고리를 찾을 수 없습니다.', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
  }
  if (category.user_id !== userId) {
    throw new AppError('접근 권한이 없습니다.', HTTP_STATUS.FORBIDDEN, ERROR_CODE.FORBIDDEN);
  }
  await categoryRepository.deleteById(categoryId);
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

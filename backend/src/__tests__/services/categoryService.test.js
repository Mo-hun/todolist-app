jest.mock('../../repositories/categoryRepository');

const categoryRepository = require('../../repositories/categoryRepository');
const AppError = require('../../utils/AppError');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../../services/categoryService');

describe('categoryService', () => {
  describe('getCategories', () => {
    it('findAllByUserId를 호출하고 카테고리 배열을 반환한다', async () => {
      const mockCategories = [
        { id: 'cat-1', user_id: 'user-1', name: '업무', created_at: new Date() },
        { id: 'cat-2', user_id: 'user-1', name: '개인', created_at: new Date() },
      ];
      categoryRepository.findAllByUserId.mockResolvedValueOnce(mockCategories);

      const result = await getCategories('user-1');

      expect(categoryRepository.findAllByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockCategories);
    });
  });

  describe('createCategory', () => {
    it('create를 호출하고 생성된 카테고리를 반환한다', async () => {
      const mockCreated = { id: 'cat-new', user_id: 'user-1', name: '학습', created_at: new Date() };
      categoryRepository.create.mockResolvedValueOnce(mockCreated);

      const result = await createCategory('user-1', { name: '학습' });

      expect(categoryRepository.create).toHaveBeenCalledWith({ userId: 'user-1', name: '학습' });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateCategory', () => {
    it('성공: findById 후 update를 호출하고 수정된 카테고리를 반환한다', async () => {
      const mockCategory = { id: 'cat-1', user_id: 'user-1', name: '업무', created_at: new Date() };
      const mockUpdated = { ...mockCategory, name: '새이름' };
      categoryRepository.findById.mockResolvedValueOnce(mockCategory);
      categoryRepository.update.mockResolvedValueOnce(mockUpdated);

      const result = await updateCategory('user-1', 'cat-1', { name: '새이름' });

      expect(categoryRepository.findById).toHaveBeenCalledWith('cat-1');
      expect(categoryRepository.update).toHaveBeenCalledWith('cat-1', { name: '새이름' });
      expect(result).toEqual(mockUpdated);
    });

    it('카테고리 없음: AppError(404, NOT_FOUND)를 던진다', async () => {
      categoryRepository.findById.mockResolvedValueOnce(null);

      await expect(updateCategory('user-1', 'not-exist', { name: '새이름' }))
        .rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });

      expect(categoryRepository.update).not.toHaveBeenCalled();
    });

    it('소유권 없음: AppError(403, FORBIDDEN)를 던진다', async () => {
      const mockCategory = { id: 'cat-1', user_id: 'other-user', name: '업무', created_at: new Date() };
      categoryRepository.findById.mockResolvedValueOnce(mockCategory);

      await expect(updateCategory('user-1', 'cat-1', { name: '새이름' }))
        .rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });

      expect(categoryRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('성공: findById 후 deleteById를 호출한다', async () => {
      const mockCategory = { id: 'cat-1', user_id: 'user-1', name: '업무', created_at: new Date() };
      categoryRepository.findById.mockResolvedValueOnce(mockCategory);
      categoryRepository.deleteById.mockResolvedValueOnce(undefined);

      const result = await deleteCategory('user-1', 'cat-1');

      expect(categoryRepository.findById).toHaveBeenCalledWith('cat-1');
      expect(categoryRepository.deleteById).toHaveBeenCalledWith('cat-1');
      expect(result).toBeUndefined();
    });

    it('카테고리 없음: AppError(404, NOT_FOUND)를 던진다', async () => {
      categoryRepository.findById.mockResolvedValueOnce(null);

      await expect(deleteCategory('user-1', 'not-exist'))
        .rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });

      expect(categoryRepository.deleteById).not.toHaveBeenCalled();
    });

    it('소유권 없음: AppError(403, FORBIDDEN)를 던진다', async () => {
      const mockCategory = { id: 'cat-1', user_id: 'other-user', name: '업무', created_at: new Date() };
      categoryRepository.findById.mockResolvedValueOnce(mockCategory);

      await expect(deleteCategory('user-1', 'cat-1'))
        .rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });

      expect(categoryRepository.deleteById).not.toHaveBeenCalled();
    });
  });
});

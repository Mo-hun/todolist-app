jest.mock('../../services/categoryService');

const categoryService = require('../../services/categoryService');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../../controllers/categoryController');
const AppError = require('../../utils/AppError');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return {
    user: { id: 'user-uuid-1', email: 'test@test.com' },
    body: {},
    params: {},
    ...overrides,
  };
}

describe('categoryController', () => {
  describe('getCategories', () => {
    it('성공: categoryService.getCategories를 호출하고 200과 categories를 응답한다', async () => {
      const mockCategories = [
        { id: 'cat-1', user_id: 'user-uuid-1', name: '업무', created_at: new Date() },
      ];
      categoryService.getCategories.mockResolvedValueOnce(mockCategories);

      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      await getCategories(req, res, next);

      expect(categoryService.getCategories).toHaveBeenCalledWith('user-uuid-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { categories: mockCategories } });
      expect(next).not.toHaveBeenCalled();
    });

    it('service 에러 발생 시 next(err)로 전달한다', async () => {
      const serviceError = new AppError('서버 에러', 500, 'INTERNAL_SERVER_ERROR');
      categoryService.getCategories.mockRejectedValueOnce(serviceError);

      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      await getCategories(req, res, next).catch((err) => next(err));

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('createCategory', () => {
    it('성공: categoryService.createCategory를 호출하고 201과 category를 응답한다', async () => {
      const mockCategory = { id: 'cat-new', user_id: 'user-uuid-1', name: '업무', created_at: new Date() };
      categoryService.createCategory.mockResolvedValueOnce(mockCategory);

      const req = mockReq({ body: { name: '업무' } });
      const res = mockRes();
      const next = jest.fn();

      await createCategory(req, res, next);

      expect(categoryService.createCategory).toHaveBeenCalledWith('user-uuid-1', { name: '업무' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { category: mockCategory } });
      expect(next).not.toHaveBeenCalled();
    });

    it('name 없음: next(AppError(400, VALIDATION_ERROR))를 호출한다', async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();
      const next = jest.fn();

      await createCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' })
      );
      expect(categoryService.createCategory).not.toHaveBeenCalled();
    });

    it('name 빈 문자열: next(AppError(400, VALIDATION_ERROR))를 호출한다', async () => {
      const req = mockReq({ body: { name: '   ' } });
      const res = mockRes();
      const next = jest.fn();

      await createCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' })
      );
      expect(categoryService.createCategory).not.toHaveBeenCalled();
    });

    it('service 에러 발생 시 next(err)로 전달한다', async () => {
      const serviceError = new AppError('서버 에러', 500, 'INTERNAL_SERVER_ERROR');
      categoryService.createCategory.mockRejectedValueOnce(serviceError);

      const req = mockReq({ body: { name: '업무' } });
      const res = mockRes();
      const next = jest.fn();

      await createCategory(req, res, next).catch((err) => next(err));

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('updateCategory', () => {
    it('성공: categoryService.updateCategory를 호출하고 200과 category를 응답한다', async () => {
      const mockCategory = { id: 'cat-1', user_id: 'user-uuid-1', name: '업무수정', created_at: new Date() };
      categoryService.updateCategory.mockResolvedValueOnce(mockCategory);

      const req = mockReq({ body: { name: '업무수정' }, params: { id: 'cat-1' } });
      const res = mockRes();
      const next = jest.fn();

      await updateCategory(req, res, next);

      expect(categoryService.updateCategory).toHaveBeenCalledWith('user-uuid-1', 'cat-1', { name: '업무수정' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { category: mockCategory } });
      expect(next).not.toHaveBeenCalled();
    });

    it('name 없음: next(AppError(400, VALIDATION_ERROR))를 호출한다', async () => {
      const req = mockReq({ body: {}, params: { id: 'cat-1' } });
      const res = mockRes();
      const next = jest.fn();

      await updateCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' })
      );
      expect(categoryService.updateCategory).not.toHaveBeenCalled();
    });

    it('name 빈 문자열: next(AppError(400, VALIDATION_ERROR))를 호출한다', async () => {
      const req = mockReq({ body: { name: '' }, params: { id: 'cat-1' } });
      const res = mockRes();
      const next = jest.fn();

      await updateCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' })
      );
      expect(categoryService.updateCategory).not.toHaveBeenCalled();
    });

    it('service 에러 발생 시 next(err)로 전달한다', async () => {
      const serviceError = new AppError('카테고리를 찾을 수 없습니다.', 404, 'NOT_FOUND');
      categoryService.updateCategory.mockRejectedValueOnce(serviceError);

      const req = mockReq({ body: { name: '업무수정' }, params: { id: 'not-exist' } });
      const res = mockRes();
      const next = jest.fn();

      await updateCategory(req, res, next).catch((err) => next(err));

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('deleteCategory', () => {
    it('성공: categoryService.deleteCategory를 호출하고 200과 message를 응답한다', async () => {
      categoryService.deleteCategory.mockResolvedValueOnce(undefined);

      const req = mockReq({ params: { id: 'cat-1' } });
      const res = mockRes();
      const next = jest.fn();

      await deleteCategory(req, res, next);

      expect(categoryService.deleteCategory).toHaveBeenCalledWith('user-uuid-1', 'cat-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { message: '카테고리가 삭제되었습니다.' } });
      expect(next).not.toHaveBeenCalled();
    });

    it('service 에러 발생 시 next(err)로 전달한다', async () => {
      const serviceError = new AppError('접근 권한이 없습니다.', 403, 'FORBIDDEN');
      categoryService.deleteCategory.mockRejectedValueOnce(serviceError);

      const req = mockReq({ params: { id: 'cat-1' } });
      const res = mockRes();
      const next = jest.fn();

      await deleteCategory(req, res, next).catch((err) => next(err));

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });
});

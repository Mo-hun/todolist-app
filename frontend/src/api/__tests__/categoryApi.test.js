import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

vi.mock('@/stores/authStore', () => ({
  default: {
    getState: vi.fn(() => ({ token: 'valid-token', clearAuth: vi.fn() })),
  },
}));

import client from '../client';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../categoryApi';

describe('categoryApi.js', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(client);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getCategories', () => {
    it('GET /api/v1/categories를 호출하고 목록을 반환한다', async () => {
      const responseData = { success: true, data: [{ id: 1, name: '업무' }, { id: 2, name: '개인' }] };
      mock.onGet('/api/v1/categories').reply(200, responseData);

      const result = await getCategories();
      expect(result).toEqual(responseData);
    });
  });

  describe('createCategory', () => {
    it('POST /api/v1/categories를 호출하고 생성된 카테고리를 반환한다', async () => {
      const categoryData = { name: '학습' };
      const responseData = { success: true, data: { id: 3, name: '학습' } };

      mock.onPost('/api/v1/categories', categoryData).reply(201, responseData);

      const result = await createCategory(categoryData);
      expect(result).toEqual(responseData);
    });
  });

  describe('updateCategory', () => {
    it('PUT /api/v1/categories/:id를 호출하고 수정된 카테고리를 반환한다', async () => {
      const updateData = { name: '업무 수정' };
      const responseData = { success: true, data: { id: 1, name: '업무 수정' } };

      mock.onPut('/api/v1/categories/1', updateData).reply(200, responseData);

      const result = await updateCategory(1, updateData);
      expect(result).toEqual(responseData);
    });

    it('권한 없는 카테고리 수정 시 에러를 throw한다', async () => {
      mock.onPut('/api/v1/categories/99').reply(403, {
        success: false,
        error: { code: 'FORBIDDEN' },
      });

      await expect(updateCategory(99, { name: '시도' })).rejects.toThrow();
    });
  });

  describe('deleteCategory', () => {
    it('DELETE /api/v1/categories/:id를 호출하고 응답 data를 반환한다', async () => {
      const responseData = { success: true, data: null };
      mock.onDelete('/api/v1/categories/1').reply(200, responseData);

      const result = await deleteCategory(1);
      expect(result).toEqual(responseData);
    });

    it('권한 없는 카테고리 삭제 시 에러를 throw한다', async () => {
      mock.onDelete('/api/v1/categories/99').reply(403, {
        success: false,
        error: { code: 'FORBIDDEN' },
      });

      await expect(deleteCategory(99)).rejects.toThrow();
    });
  });
});

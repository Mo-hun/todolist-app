import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

vi.mock('@/stores/authStore', () => ({
  default: {
    getState: vi.fn(() => ({ token: 'valid-token', clearAuth: vi.fn() })),
  },
}));

import client from '../client';
import { getTodos, createTodo, getTodoById, updateTodo, deleteTodo, toggleTodo } from '../todoApi';

describe('todoApi.js', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(client);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getTodos', () => {
    it('GET /api/v1/todos를 호출하고 응답 data를 반환한다', async () => {
      const responseData = { success: true, data: [{ id: 1, title: '할일 1' }] };
      mock.onGet('/api/v1/todos').reply(200, responseData);

      const result = await getTodos();
      expect(result).toEqual(responseData);
    });

    it('쿼리 파라미터를 함께 전달한다', async () => {
      const params = { filter: 'pending', sortBy: 'due_date' };
      const responseData = { success: true, data: [] };

      mock.onGet('/api/v1/todos', { params }).reply(200, responseData);

      const result = await getTodos(params);
      expect(result).toEqual(responseData);
    });
  });

  describe('createTodo', () => {
    it('POST /api/v1/todos를 호출하고 생성된 항목을 반환한다', async () => {
      const todoData = { title: '새 할일', description: '설명' };
      const responseData = { success: true, data: { id: 1, ...todoData } };

      mock.onPost('/api/v1/todos', todoData).reply(201, responseData);

      const result = await createTodo(todoData);
      expect(result).toEqual(responseData);
    });
  });

  describe('getTodoById', () => {
    it('GET /api/v1/todos/:id를 호출하고 해당 항목을 반환한다', async () => {
      const responseData = { success: true, data: { id: 1, title: '할일 1' } };
      mock.onGet('/api/v1/todos/1').reply(200, responseData);

      const result = await getTodoById(1);
      expect(result).toEqual(responseData);
    });
  });

  describe('updateTodo', () => {
    it('PUT /api/v1/todos/:id를 호출하고 수정된 항목을 반환한다', async () => {
      const updateData = { title: '수정된 할일' };
      const responseData = { success: true, data: { id: 1, ...updateData } };

      mock.onPut('/api/v1/todos/1', updateData).reply(200, responseData);

      const result = await updateTodo(1, updateData);
      expect(result).toEqual(responseData);
    });
  });

  describe('deleteTodo', () => {
    it('DELETE /api/v1/todos/:id를 호출하고 응답 data를 반환한다', async () => {
      const responseData = { success: true, data: null };
      mock.onDelete('/api/v1/todos/1').reply(200, responseData);

      const result = await deleteTodo(1);
      expect(result).toEqual(responseData);
    });
  });

  describe('toggleTodo', () => {
    it('PATCH /api/v1/todos/:id/complete를 호출하고 토글된 항목을 반환한다', async () => {
      const responseData = { success: true, data: { id: 1, completed: true } };
      mock.onPatch('/api/v1/todos/1/complete').reply(200, responseData);

      const result = await toggleTodo(1);
      expect(result).toEqual(responseData);
    });
  });
});

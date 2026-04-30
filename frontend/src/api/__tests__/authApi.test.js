import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

vi.mock('@/stores/authStore', () => ({
  default: {
    getState: vi.fn(() => ({ token: null, clearAuth: vi.fn() })),
  },
}));

import client from '../client';
import { login, register, withdraw } from '../authApi';

describe('authApi.js', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(client);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('login', () => {
    it('POST /api/v1/auth/login을 호출하고 응답 data를 반환한다', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const responseData = { success: true, data: { token: 'jwt-token', user: { id: 1 } } };

      mock.onPost('/api/v1/auth/login', credentials).reply(200, responseData);

      const result = await login(credentials);
      expect(result).toEqual(responseData);
    });

    it('잘못된 자격증명이면 에러를 throw한다', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      mock.onPost('/api/v1/auth/login').reply(401, { success: false, error: { code: 'UNAUTHORIZED' } });

      await expect(login(credentials)).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('POST /api/v1/auth/register를 호출하고 응답 data를 반환한다', async () => {
      const userData = { email: 'new@example.com', password: 'password123' };
      const responseData = { success: true, data: { id: 1, email: 'new@example.com' } };

      mock.onPost('/api/v1/auth/register', userData).reply(201, responseData);

      const result = await register(userData);
      expect(result).toEqual(responseData);
    });

    it('중복 이메일이면 에러를 throw한다', async () => {
      const userData = { email: 'existing@example.com', password: 'password123' };
      mock.onPost('/api/v1/auth/register').reply(409, {
        success: false,
        error: { code: 'DUPLICATE_EMAIL' },
      });

      await expect(register(userData)).rejects.toThrow();
    });
  });

  describe('withdraw', () => {
    it('DELETE /api/v1/auth/me를 호출하고 응답 data를 반환한다', async () => {
      const responseData = { success: true, data: null };

      mock.onDelete('/api/v1/auth/me').reply(200, responseData);

      const result = await withdraw();
      expect(result).toEqual(responseData);
    });
  });
});

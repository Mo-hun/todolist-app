import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

// authStore 모킹
vi.mock('@/stores/authStore', () => {
  const clearAuth = vi.fn();
  const store = {
    getState: vi.fn(() => ({
      token: null,
      clearAuth,
    })),
  };
  return { default: store };
});

import client from '../client';
import useAuthStore from '@/stores/authStore';

describe('client.js - axios 인스턴스', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(client);
    // 기본 상태: 토큰 없음
    useAuthStore.getState.mockReturnValue({ token: null, clearAuth: vi.fn() });
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  describe('요청 인터셉터', () => {
    it('토큰이 없을 때 Authorization 헤더를 추가하지 않는다', async () => {
      useAuthStore.getState.mockReturnValue({ token: null, clearAuth: vi.fn() });
      mock.onGet('/api/v1/test').reply((config) => {
        expect(config.headers.Authorization).toBeUndefined();
        return [200, { success: true }];
      });

      await client.get('/api/v1/test');
    });

    it('토큰이 있을 때 Authorization 헤더를 Bearer 형식으로 추가한다', async () => {
      const testToken = 'test-jwt-token-12345';
      useAuthStore.getState.mockReturnValue({ token: testToken, clearAuth: vi.fn() });

      mock.onGet('/api/v1/test').reply((config) => {
        expect(config.headers.Authorization).toBe(`Bearer ${testToken}`);
        return [200, { success: true }];
      });

      await client.get('/api/v1/test');
    });
  });

  describe('응답 인터셉터', () => {
    it('401 응답 시 clearAuth를 호출하고 /login으로 리다이렉트한다', async () => {
      const clearAuth = vi.fn();
      useAuthStore.getState.mockReturnValue({ token: 'expired-token', clearAuth });

      // window.location.href 모킹
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      mock.onGet('/api/v1/protected').reply(401, { error: 'Unauthorized' });

      await expect(client.get('/api/v1/protected')).rejects.toThrow();

      expect(clearAuth).toHaveBeenCalledTimes(1);
      expect(window.location.href).toBe('/login');

      window.location = originalLocation;
    });

    it('401이 아닌 에러는 clearAuth를 호출하지 않는다', async () => {
      const clearAuth = vi.fn();
      useAuthStore.getState.mockReturnValue({ token: 'valid-token', clearAuth });

      mock.onGet('/api/v1/notfound').reply(404, { error: 'Not Found' });

      await expect(client.get('/api/v1/notfound')).rejects.toThrow();

      expect(clearAuth).not.toHaveBeenCalled();
    });

    it('성공 응답은 그대로 반환한다', async () => {
      useAuthStore.getState.mockReturnValue({ token: null, clearAuth: vi.fn() });
      mock.onGet('/api/v1/success').reply(200, { success: true, data: { id: 1 } });

      const response = await client.get('/api/v1/success');
      expect(response.data).toEqual({ success: true, data: { id: 1 } });
    });
  });
});

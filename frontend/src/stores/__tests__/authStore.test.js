import { beforeEach, describe, expect, it } from 'vitest';
import useAuthStore from '../authStore';

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  localStorage.clear();
});

describe('authStore', () => {
  it('초기 상태가 올바르다', () => {
    const { token, user, isAuthenticated } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('setAuth 호출 후 상태가 변경된다', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth('test-token', { id: 1, email: 'test@example.com' });

    const { token, user, isAuthenticated } = useAuthStore.getState();
    expect(token).toBe('test-token');
    expect(user).toEqual({ id: 1, email: 'test@example.com' });
    expect(isAuthenticated).toBe(true);
  });

  it('clearAuth 호출 후 초기 상태로 복원된다', () => {
    const { setAuth, clearAuth } = useAuthStore.getState();
    setAuth('test-token', { id: 1, email: 'test@example.com' });
    clearAuth();

    const { token, user, isAuthenticated } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('persist 미들웨어가 적용되어 localStorage에 저장된다', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth('persist-token', { id: 2, email: 'persist@example.com' });

    const stored = localStorage.getItem('auth-storage');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored);
    expect(parsed.state.token).toBe('persist-token');
    expect(parsed.state.isAuthenticated).toBe(true);
  });
});

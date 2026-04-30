import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useLoginMutation, useRegisterMutation } from '../useAuth';

const mockNavigate = vi.fn();
const mockSetAuth = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  default: vi.fn((selector) => selector({ setAuth: mockSetAuth })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('useLoginMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 setAuth 호출 및 "/" 으로 이동', async () => {
    const { login } = await import('@/api/authApi');
    login.mockResolvedValue({
      data: { token: 'test-token', user: { id: 1, email: 'test@example.com' } },
    });

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'password' });
    });

    expect(mockSetAuth).toHaveBeenCalledWith('test-token', { id: 1, email: 'test@example.com' });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('실패 시 에러 상태 확인', async () => {
    const { login } = await import('@/api/authApi');
    const mockError = new Error('인증 실패');
    login.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ email: 'wrong@example.com', password: 'wrong' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(mockError);
  });
});

describe('useRegisterMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 "/login" 으로 이동', async () => {
    const { register } = await import('@/api/authApi');
    register.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ email: 'new@example.com', password: 'password' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AppRouter from '../AppRouter';

vi.mock('@/stores/authStore', () => ({
  default: vi.fn(),
}));

import useAuthStore from '@/stores/authStore';

function renderWithProviders(initialEntries) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

test('/login 경로에서 LoginPage 렌더링 (미인증)', () => {
  useAuthStore.mockReturnValue(false);
  renderWithProviders(['/login']);
  expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
});

test('/register 경로에서 RegisterPage 렌더링 (미인증)', () => {
  useAuthStore.mockReturnValue(false);
  renderWithProviders(['/register']);
  expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument();
});

test('알 수 없는 경로는 /로 리다이렉트 (미인증이면 /login으로)', () => {
  useAuthStore.mockReturnValue(false);
  renderWithProviders(['/unknown-path']);
  expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
});

test('인증 상태에서 / 경로로 MainPage 렌더링', () => {
  useAuthStore.mockReturnValue(true);
  renderWithProviders(['/']);
  expect(screen.getByText('TodoList')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '로그아웃 →' })).toBeInTheDocument();
});

test('인증 상태에서 /login 접근 시 /로 리다이렉트', () => {
  useAuthStore.mockReturnValue(true);
  renderWithProviders(['/login']);
  expect(screen.getByText('TodoList')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '로그아웃 →' })).toBeInTheDocument();
});

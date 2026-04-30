import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import PublicRoute from '../PublicRoute';

vi.mock('@/stores/authStore', () => ({
  default: vi.fn(),
}));

import useAuthStore from '@/stores/authStore';

test('인증 상태에서 /로 리다이렉트', () => {
  useAuthStore.mockReturnValue(true);
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<PublicRoute><div>login page</div></PublicRoute>} />
        <Route path="/" element={<div>main page</div>} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText('main page')).toBeInTheDocument();
});

test('미인증 상태에서 children 렌더링', () => {
  useAuthStore.mockReturnValue(false);
  render(
    <MemoryRouter>
      <PublicRoute><div>public content</div></PublicRoute>
    </MemoryRouter>
  );
  expect(screen.getByText('public content')).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import PrivateRoute from '../PrivateRoute';

vi.mock('@/stores/authStore', () => ({
  default: vi.fn(),
}));

import useAuthStore from '@/stores/authStore';

test('미인증 상태에서 /login으로 리다이렉트', () => {
  useAuthStore.mockReturnValue(false);
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<PrivateRoute><div>protected</div></PrivateRoute>} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText('login page')).toBeInTheDocument();
});

test('인증 상태에서 children 렌더링', () => {
  useAuthStore.mockReturnValue(true);
  render(
    <MemoryRouter>
      <PrivateRoute><div>protected content</div></PrivateRoute>
    </MemoryRouter>
  );
  expect(screen.getByText('protected content')).toBeInTheDocument();
});

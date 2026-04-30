import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import client from '@/api/client';
import useAuthStore from '@/stores/authStore';
import MainPage from '@/pages/MainPage';

const mock = new MockAdapter(client);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      {children}
    </MemoryRouter>
  </QueryClientProvider>
);

describe('FE-09 Integration & Edge Cases', () => {
  beforeEach(() => {
    mock.reset();
    queryClient.clear();
    useAuthStore.getState().setAuth('fake-token', { id: 1, email: 'test@example.com' });
    
    // Mock window.location
    delete window.location;
    window.location = { href: vi.fn() };
  });

  it('401 응답 시 로그아웃되고 /login으로 리다이렉트된다', async () => {
    mock.onGet('/api/v1/categories').reply(401);
    mock.onGet('/api/v1/todos').reply(401);

    render(<MainPage />, { wrapper });

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(window.location.href).toBe('/login');
    });
  });

  it('할일 목록이 비어있을 때 적절한 안내 메시지를 표시한다', async () => {
    mock.onGet('/api/v1/categories').reply(200, []);
    mock.onGet('/api/v1/todos').reply(200, { success: true, data: [] });

    render(<MainPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/할 일이 없습니다/i)).toBeInTheDocument();
    });
  });

  it('마감일이 없는 할일은 정상적으로 렌더링되며 기한초과 판별에서 제외된다', async () => {
    const todoWithoutDueDate = {
      id: 1,
      title: '마감일 없는 할일',
      is_completed: false,
      due_date: null,
      category_id: null,
    };

    mock.onGet('/api/v1/categories').reply(200, []);
    mock.onGet('/api/v1/todos').reply(200, { 
      success: true, 
      data: [todoWithoutDueDate] 
    });

    render(<MainPage />, { wrapper });

    await waitFor(() => {
      const todoItem = screen.getByText('마감일 없는 할일').closest('article');
      expect(todoItem).toBeInTheDocument();
      // 기한초과(red)나 기한임박(orange) 클래스가 없어야 함
      expect(todoItem).not.toHaveClass('bg-red-50');
      expect(todoItem).not.toHaveClass('bg-orange-50');
      expect(todoItem).toHaveClass('bg-white');
    });
  });
});

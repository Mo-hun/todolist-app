import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useGetTodos,
  useToggleTodoMutation,
  useUpdateTodoMutation,
} from '../useTodos';

vi.mock('@/api/todoApi', () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  toggleTodo: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    queryClient,
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  };
}

describe('useGetTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sort_by와 category_id를 API에 전달하고 completed 필터를 클라이언트에서 적용한다', async () => {
    const { getTodos } = await import('@/api/todoApi');
    getTodos.mockResolvedValue({
      data: [
        { id: 1, is_completed: true, category_id: 'cat-1' },
        { id: 2, is_completed: false, category_id: 'cat-1' },
      ],
      pagination: { page: 1, limit: 20, total: 2 },
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useGetTodos({ filter: 'completed', sortBy: 'due_date', categoryId: 'cat-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getTodos).toHaveBeenCalledWith({ sort_by: 'due_date', category_id: 'cat-1' });
    expect(result.current.data.todos).toEqual([{ id: 1, is_completed: true, category_id: 'cat-1' }]);
  });

  it('uncategorized 선택 시 category_id가 없는 할일만 남긴다', async () => {
    const { getTodos } = await import('@/api/todoApi');
    getTodos.mockResolvedValue({
      data: [
        { id: 1, is_completed: false, category_id: null },
        { id: 2, is_completed: false, category_id: 'cat-1' },
      ],
      pagination: { page: 1, limit: 20, total: 2 },
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useGetTodos({ filter: 'all', sortBy: 'created_at', categoryId: 'uncategorized' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getTodos).toHaveBeenCalledWith({ sort_by: 'created_at' });
    expect(result.current.data.todos).toEqual([{ id: 1, is_completed: false, category_id: null }]);
  });
});

describe('todo mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create/update/delete/toggle 성공 시 todos 쿼리를 무효화한다', async () => {
    const api = await import('@/api/todoApi');
    api.createTodo.mockResolvedValue({ data: { todo: { id: 1 } } });
    api.updateTodo.mockResolvedValue({ data: { todo: { id: 1 } } });
    api.deleteTodo.mockResolvedValue({ data: { message: 'ok' } });
    api.toggleTodo.mockResolvedValue({ data: { todo: { id: 1, is_completed: true } } });

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const create = renderHook(() => useCreateTodoMutation(), { wrapper });
    const update = renderHook(() => useUpdateTodoMutation(), { wrapper });
    const remove = renderHook(() => useDeleteTodoMutation(), { wrapper });
    const toggle = renderHook(() => useToggleTodoMutation(), { wrapper });

    create.result.current.mutate({ title: '새 할일' });
    update.result.current.mutate({ id: 1, data: { title: '수정' } });
    remove.result.current.mutate(1);
    toggle.result.current.mutate(1);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
    });
  });
});

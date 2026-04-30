import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  useGetCategories,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../useCategories';

vi.mock('@/api/categoryApi', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGetCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('카테고리 목록을 반환한다', async () => {
    const { getCategories } = await import('@/api/categoryApi');
    const mockCategories = [
      { id: 1, name: '업무' },
      { id: 2, name: '개인' },
    ];
    getCategories.mockResolvedValue({ data: { categories: mockCategories } });

    const { result } = renderHook(() => useGetCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCategories);
  });

  it('categories가 없을 경우 빈 배열을 반환한다', async () => {
    const { getCategories } = await import('@/api/categoryApi');
    getCategories.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useGetCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});

describe('useCreateCategoryMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 categories 쿼리를 무효화한다', async () => {
    const { createCategory } = await import('@/api/categoryApi');
    createCategory.mockResolvedValue({ data: { category: { id: 3, name: '학습' } } });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateCategoryMutation(), { wrapper });

    await act(async () => {
      result.current.mutate({ name: '학습' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });
});

describe('useUpdateCategoryMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 categories 쿼리를 무효화한다', async () => {
    const { updateCategory } = await import('@/api/categoryApi');
    updateCategory.mockResolvedValue({ data: { category: { id: 1, name: '업무 수정' } } });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateCategoryMutation(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 1, data: { name: '업무 수정' } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });
});

describe('useDeleteCategoryMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 categories 쿼리를 무효화한다', async () => {
    const { deleteCategory } = await import('@/api/categoryApi');
    deleteCategory.mockResolvedValue({ data: null });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteCategoryMutation(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });
});

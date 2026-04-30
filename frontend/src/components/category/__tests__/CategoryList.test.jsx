import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategoryList from '../CategoryList';

vi.mock('@/hooks/useCategories', () => ({
  useGetCategories: vi.fn(),
  useUpdateCategoryMutation: vi.fn(),
  useDeleteCategoryMutation: vi.fn(),
}));

describe('CategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로딩 중에 Spinner를 렌더링한다', async () => {
    const { useGetCategories, useUpdateCategoryMutation, useDeleteCategoryMutation } =
      await import('@/hooks/useCategories');

    useGetCategories.mockReturnValue({ data: [], isLoading: true });
    useUpdateCategoryMutation.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useDeleteCategoryMutation.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(<CategoryList />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('카테고리가 없을 때 안내 문구를 표시한다', async () => {
    const { useGetCategories, useUpdateCategoryMutation, useDeleteCategoryMutation } =
      await import('@/hooks/useCategories');

    useGetCategories.mockReturnValue({ data: [], isLoading: false });
    useUpdateCategoryMutation.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useDeleteCategoryMutation.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(<CategoryList />);
    expect(screen.getByText('카테고리가 없습니다. 새 카테고리를 추가해보세요.')).toBeInTheDocument();
  });

  it('카테고리 목록을 렌더링한다', async () => {
    const { useGetCategories, useUpdateCategoryMutation, useDeleteCategoryMutation } =
      await import('@/hooks/useCategories');

    const mockCategories = [
      { id: 1, name: '업무', user_id: 'u1', created_at: '2026-01-01' },
      { id: 2, name: '개인', user_id: 'u1', created_at: '2026-01-01' },
    ];

    useGetCategories.mockReturnValue({ data: mockCategories, isLoading: false });
    useUpdateCategoryMutation.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useDeleteCategoryMutation.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(<CategoryList />);
    expect(screen.getByText(/#\s*업무/)).toBeInTheDocument();
    expect(screen.getByText(/#\s*개인/)).toBeInTheDocument();
  });
});

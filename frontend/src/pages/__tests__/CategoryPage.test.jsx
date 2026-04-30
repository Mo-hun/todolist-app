import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategoryPage from '../CategoryPage';

const mockMutate = vi.fn();

vi.mock('@/hooks/useCategories', () => ({
  useCreateCategoryMutation: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

vi.mock('@/components/category', () => ({
  CategoryList: () => <div data-testid="category-list">category list</div>,
  CategoryForm: ({ onSubmit, onCancel, isPending }) => (
    <form
      aria-label="category-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit('사이드 프로젝트');
      }}
    >
      <div>{isPending ? 'pending' : 'idle'}</div>
      <button type="button" onClick={onCancel}>취소</button>
      <button type="submit">생성</button>
    </form>
  ),
}));

describe('CategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => render(
    <MemoryRouter>
      <CategoryPage />
    </MemoryRouter>
  );

  it('카테고리 제목, 추가 버튼, 목록을 렌더링한다', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: '카테고리' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ 새 카테고리 추가' })).toBeInTheDocument();
    expect(screen.getByTestId('category-list')).toBeInTheDocument();
  });

  it('추가 버튼 클릭 시 생성 Modal이 열리고 취소로 닫을 수 있다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '+ 새 카테고리 추가' }));

    expect(screen.getByText('새 카테고리 추가')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'category-form' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.queryByText('새 카테고리 추가')).not.toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('생성 제출 시 create mutate를 호출하고 성공 콜백에서 Modal을 닫는다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '+ 새 카테고리 추가' }));
    await user.click(screen.getByRole('button', { name: '생성' }));

    expect(mockMutate).toHaveBeenCalledWith(
      { name: '사이드 프로젝트' },
      { onSuccess: expect.any(Function) }
    );

    const [, options] = mockMutate.mock.calls[0];
    await act(async () => {
      options.onSuccess();
    });

    await waitFor(() => {
      expect(screen.queryByText('새 카테고리 추가')).not.toBeInTheDocument();
    });
  });
});

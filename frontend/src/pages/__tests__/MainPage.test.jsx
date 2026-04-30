import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MainPage from '../MainPage';

const mockNavigate = vi.fn();
const mockCreateTodo = vi.fn();
const mockUpdateTodo = vi.fn();
const mockDeleteTodo = vi.fn();
const mockToggleTodo = vi.fn();
const mockSelectCategory = vi.fn();
const mockSetFilter = vi.fn();
const mockSetSortBy = vi.fn();
const mockClearAuth = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useCategories', () => ({
  useGetCategories: vi.fn(() => ({
    data: [
      { id: 'cat-1', name: '업무' },
      { id: 'cat-2', name: '개인' },
    ],
  })),
}));

vi.mock('@/hooks/useTodos', () => ({
  useGetTodos: vi.fn(() => ({
    data: {
      todos: [
        {
          id: 'todo-1',
          title: '진행중 할일',
          category_id: 'cat-1',
          is_completed: false,
          is_due_soon: false,
          is_overdue: false,
        },
        {
          id: 'todo-2',
          title: '완료 할일',
          category_id: null,
          is_completed: true,
          is_due_soon: false,
          is_overdue: false,
        },
      ],
      pagination: { page: 1, limit: 20, total: 2 },
    },
    isLoading: false,
  })),
  useCreateTodoMutation: vi.fn(() => ({
    mutate: mockCreateTodo,
    isPending: false,
  })),
  useUpdateTodoMutation: vi.fn(() => ({
    mutate: mockUpdateTodo,
    isPending: false,
  })),
  useDeleteTodoMutation: vi.fn(() => ({
    mutate: mockDeleteTodo,
    isPending: false,
  })),
  useToggleTodoMutation: vi.fn(() => ({
    mutate: mockToggleTodo,
    isPending: false,
  })),
}));

vi.mock('@/stores/categoryStore', () => ({
  default: vi.fn((selector) => selector({
    selectedCategoryId: null,
    selectCategory: mockSelectCategory,
  })),
}));

vi.mock('@/stores/todoStore', () => ({
  default: vi.fn((selector) => selector({
    filter: 'all',
    sortBy: 'created_at',
    setFilter: mockSetFilter,
    setSortBy: mockSetSortBy,
  })),
}));

vi.mock('@/stores/authStore', () => ({
  default: vi.fn((selector) => selector({
    clearAuth: mockClearAuth,
  })),
}));

describe('MainPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderPage() {
    return render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );
  }

  it('카테고리 필터, 상태 탭, 섹션 헤더, 카테고리 관리 링크를 렌더링한다', () => {
    renderPage();

    expect(screen.getByText('카테고리')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '전체' }).length).toBe(2);
    expect(screen.getByRole('button', { name: '업무' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '미분류' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '진행중' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
    expect(screen.getByText('진행중 (1)')).toBeInTheDocument();
    expect(screen.getByText('완료 (1)')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '카테고리 →' }).length).toBeGreaterThan(0);
  });

  it('카테고리 선택, 상태 전환, 정렬 변경을 스토어 액션으로 전달한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '업무' }));
    await user.click(screen.getByRole('button', { name: '완료' }));
    await user.selectOptions(screen.getByLabelText('정렬 기준'), 'due_date');

    expect(mockSelectCategory).toHaveBeenCalledWith('cat-1');
    expect(mockSetFilter).toHaveBeenCalledWith('completed');
    expect(mockSetSortBy).toHaveBeenCalledWith('due_date');
  });

  it('새 할일 추가 모달에서 생성 성공 시 모달이 닫힌다', async () => {
    const user = userEvent.setup();
    mockCreateTodo.mockImplementation((_payload, options) => options.onSuccess?.());

    renderPage();

    await user.click(screen.getByRole('button', { name: '+ 새 할 일 추가' }));
    await user.type(screen.getByLabelText('제목'), '새 할일');
    await user.click(screen.getAllByRole('button', { name: '추가' }).at(-1));

    expect(mockCreateTodo).toHaveBeenCalledWith(
      expect.objectContaining({ title: '새 할일' }),
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );

    await waitFor(() => {
      expect(screen.queryByText('새 할 일 추가')).not.toBeInTheDocument();
    });
  });

  it('로그아웃 버튼 클릭 시 clearAuth 후 /login으로 이동한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '로그아웃 →' }));

    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

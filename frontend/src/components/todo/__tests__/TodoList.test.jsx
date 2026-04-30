import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TodoList from '../TodoList';

vi.mock('@/hooks/useTodos', () => ({
  useUpdateTodoMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteTodoMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useToggleTodoMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

describe('TodoList', () => {
  it('로딩 중에는 Spinner를 렌더링한다', () => {
    render(<TodoList todos={[]} isLoading emptyMessage="empty" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('빈 목록이면 안내 문구를 렌더링한다', () => {
    render(<TodoList todos={[]} isLoading={false} emptyMessage="아직 등록된 할일이 없습니다." />);
    expect(screen.getByText('아직 등록된 할일이 없습니다.')).toBeInTheDocument();
  });

  it('할일 목록을 렌더링한다', () => {
    render(
      <TodoList
        todos={[{ id: 'todo-1', title: '할일 1', is_completed: false, is_due_soon: false, is_overdue: false }]}
        isLoading={false}
        emptyMessage="empty"
      />
    );

    expect(screen.getByText('할일 1')).toBeInTheDocument();
  });
});

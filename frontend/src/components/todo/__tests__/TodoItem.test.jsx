import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TodoItem from '../TodoItem';

vi.mock('@/hooks/useCategories', () => ({
  useGetCategories: vi.fn(() => ({ data: [] })),
}));

const mockTodo = {
  id: 'todo-1',
  title: 'Q2 마케팅 보고서 작성',
  description: '전환율 데이터 포함',
  category_id: 'cat-1',
  category_name: '업무',
  due_date: '2026-05-01T00:00:00.000Z',
  is_completed: false,
  is_due_soon: true,
  is_overdue: false,
};

describe('TodoItem', () => {
  it('체크박스, 제목, 배지, 설명, 수정/삭제 버튼을 렌더링한다', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('checkbox', { name: /완료 토글/i })).toBeInTheDocument();
    expect(screen.getByText('Q2 마케팅 보고서 작성')).toBeInTheDocument();
    expect(screen.getByText('#업무')).toBeInTheDocument();
    expect(screen.getByText('기한임박')).toBeInTheDocument();
    expect(screen.getByText('전환율 데이터 포함')).toBeInTheDocument();
  });

  it('체크박스 클릭 시 onToggle에 id를 전달한다', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<TodoItem todo={mockTodo} onToggle={onToggle} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    await user.click(screen.getByRole('checkbox', { name: /완료 토글/i }));

    expect(onToggle).toHaveBeenCalledWith('todo-1');
  });

  it('수정 모달과 삭제 모달을 열 수 있다', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '수정' }));
    expect(screen.getByText('할 일 수정')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.getByText('할 일 삭제')).toBeInTheDocument();
    expect(screen.getByText(/삭제된 데이터는 복구할 수 없습니다/)).toBeInTheDocument();
  });
});

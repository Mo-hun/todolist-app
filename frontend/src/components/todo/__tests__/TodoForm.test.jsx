import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TodoForm from '../TodoForm';

vi.mock('@/hooks/useCategories', () => ({
  useGetCategories: vi.fn(() => ({
    data: [
      { id: 'cat-1', name: '업무' },
      { id: 'cat-2', name: '개인' },
    ],
  })),
}));

describe('TodoForm', () => {
  it('제목, 설명, 카테고리, 마감일 필드와 추가 버튼을 렌더링한다', () => {
    render(<TodoForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    expect(screen.getByLabelText('마감일')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('유효한 값으로 제출하면 snake_case payload를 전달한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('제목'), '  기획안 작성  ');
    await user.type(screen.getByLabelText('설명'), '요약 작성');
    await user.selectOptions(screen.getByLabelText('카테고리'), 'cat-1');
    await user.type(screen.getByLabelText('마감일'), '2026-05-01');
    await user.click(screen.getByRole('button', { name: '추가' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: '기획안 작성',
      description: '요약 작성',
      due_date: '2026-05-01',
      category_id: 'cat-1',
    });
  });

  it('수정 모드에서는 기존 값과 "수정 저장" 버튼을 사용한다', () => {
    render(
      <TodoForm
        initialValues={{
          id: 'todo-1',
          title: '기존 제목',
          description: '기존 설명',
          category_id: 'cat-2',
          due_date: '2026-05-03T00:00:00.000Z',
        }}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('기존 제목')).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 설명')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-05-03')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });
});

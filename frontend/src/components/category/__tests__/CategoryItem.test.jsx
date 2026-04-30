import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CategoryItem from '../CategoryItem';

const mockCategory = { id: 1, name: '업무', user_id: 'user1', created_at: '2026-01-01', todoCount: 5 };

describe('CategoryItem', () => {
  it('카테고리 이름을 렌더링한다', () => {
    render(
    <CategoryItem
        category={mockCategory}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        isUpdating={false}
        isDeleting={false}
      />
    );
    expect(screen.getByText(/#\s*업무/)).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 수정 Modal이 열린다', async () => {
    const user = userEvent.setup();
    render(
      <CategoryItem
        category={mockCategory}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        isUpdating={false}
        isDeleting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: '수정' }));
    expect(screen.getByText('카테고리 수정')).toBeInTheDocument();
    expect(screen.getByDisplayValue('업무')).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 삭제 확인 Modal이 열린다', async () => {
    const user = userEvent.setup();
    render(
      <CategoryItem
        category={mockCategory}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        isUpdating={false}
        isDeleting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.getByText('카테고리 삭제')).toBeInTheDocument();
    expect(screen.getByText(/"업무" 카테고리를 삭제하시겠습니까\?/)).toBeInTheDocument();
  });

  it('수정 Modal에서 제출 시 category id와 trim된 이름으로 onUpdate를 호출한다', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(
      <CategoryItem
        category={mockCategory}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
        isUpdating={false}
        isDeleting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: '수정' }));
    const input = screen.getByLabelText('카테고리 이름');
    await user.clear(input);
    await user.type(input, '  마트 장보기  ');
    const submitButtons = screen.getAllByRole('button', { name: '저장' });
    await user.click(submitButtons[submitButtons.length - 1]);

    expect(onUpdate).toHaveBeenCalledWith({
      id: mockCategory.id,
      data: { name: '마트 장보기' },
    }, expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('삭제 Modal에서 취소 클릭 시 onDelete가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <CategoryItem
        category={mockCategory}
        onUpdate={vi.fn()}
        onDelete={onDelete}
        isUpdating={false}
        isDeleting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: '삭제' }));
    const cancelButtons = screen.getAllByRole('button', { name: '취소' });
    await user.click(cancelButtons[0]);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('삭제 Modal에서 삭제 확인 시 onDelete가 category.id로 호출된다', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <CategoryItem
        category={mockCategory}
        onUpdate={vi.fn()}
        onDelete={onDelete}
        isUpdating={false}
        isDeleting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: '삭제' }));
    const deleteButtons = screen.getAllByRole('button', { name: '삭제' });
    // 두 번째 삭제 버튼은 Modal 내부의 확인 버튼
    await user.click(deleteButtons[deleteButtons.length - 1]);

    expect(onDelete).toHaveBeenCalledWith(
      mockCategory.id,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });
});

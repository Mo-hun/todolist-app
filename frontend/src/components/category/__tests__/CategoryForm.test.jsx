import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CategoryForm from '../CategoryForm';

describe('CategoryForm', () => {
  it('initialName 없으면 생성 모드 - "추가" 버튼을 렌더링한다', () => {
    render(<CategoryForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('initialName 있으면 수정 모드 - "수정 저장" 버튼을 렌더링한다', () => {
    render(<CategoryForm initialName="업무" onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('수정 모드에서 입력 필드에 initialName이 채워진다', () => {
    render(<CategoryForm initialName="업무" onSubmit={vi.fn()} />);
    expect(screen.getByDisplayValue('업무')).toBeInTheDocument();
  });

  it('빈 이름으로 제출 시 onSubmit이 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CategoryForm onSubmit={onSubmit} />);

    const submitBtn = screen.getByRole('button', { name: '추가' });
    await user.click(submitBtn);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('유효한 이름 입력 후 제출 시 onSubmit이 trim된 값으로 호출된다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CategoryForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('카테고리 이름을 입력하세요'), '  학습  ');
    await user.click(screen.getByRole('button', { name: '추가' }));

    expect(onSubmit).toHaveBeenCalledWith('학습');
  });

  it('비어 있는 이름이면 제출 버튼이 비활성화된다', () => {
    render(<CategoryForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: '추가' })).toBeDisabled();
  });

  it('onCancel이 있으면 취소 버튼이 렌더링된다', () => {
    render(<CategoryForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 onCancel이 호출된다', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<CategoryForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

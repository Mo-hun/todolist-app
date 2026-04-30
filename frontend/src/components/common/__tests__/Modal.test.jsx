import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Modal from '../Modal';

describe('Modal', () => {
  it('isOpen=false일 때 아무것도 렌더링하지 않는다', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="제목">내용</Modal>);
    expect(screen.queryByText('제목')).not.toBeInTheDocument();
    expect(screen.queryByText('내용')).not.toBeInTheDocument();
  });

  it('isOpen=true일 때 title과 children이 렌더링된다', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="모달 제목">모달 내용</Modal>);
    expect(screen.getByText('모달 제목')).toBeInTheDocument();
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('오버레이 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="제목">내용</Modal>);
    const overlay = screen.getByText('제목').closest('.fixed');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ESC 키 누를 때 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="제목">내용</Modal>);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('모달 내부 클릭 시 onClose가 호출되지 않는다', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="제목">내용</Modal>);
    const modalContent = screen.getByText('제목').closest('.bg-white');
    fireEvent.click(modalContent);
    expect(onClose).not.toHaveBeenCalled();
  });
});

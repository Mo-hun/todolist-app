import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button', () => {
  it('primary variant 클래스를 렌더링한다', () => {
    render(<Button variant="primary">확인</Button>);
    const btn = screen.getByRole('button', { name: '확인' });
    expect(btn).toHaveClass('bg-brand-blue', 'text-white');
  });

  it('secondary variant 클래스를 렌더링한다', () => {
    render(<Button variant="secondary">취소</Button>);
    const btn = screen.getByRole('button', { name: '취소' });
    expect(btn).toHaveClass('text-black');
  });

  it('danger variant 클래스를 렌더링한다', () => {
    render(<Button variant="danger">삭제</Button>);
    const btn = screen.getByRole('button', { name: '삭제' });
    expect(btn).toHaveClass('bg-brand-red', 'text-white');
  });

  it('loading 상태에서 버튼이 disabled 처리된다', () => {
    render(<Button loading>저장</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('loading 상태에서 Spinner가 렌더링된다', () => {
    render(<Button loading>저장</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('disabled prop 시 버튼이 비활성화된다', () => {
    render(<Button disabled>저장</Button>);
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  it('onClick 핸들러가 호출된다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    await user.click(screen.getByRole('button', { name: '클릭' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

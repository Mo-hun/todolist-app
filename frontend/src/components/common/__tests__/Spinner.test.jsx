import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Spinner from '../Spinner';

describe('Spinner', () => {
  it('role="status"가 존재한다', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sm size 클래스가 적용된다', () => {
    render(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-3', 'h-3');
  });

  it('md size 클래스가 적용된다', () => {
    render(<Spinner size="md" />);
    expect(screen.getByRole('status')).toHaveClass('w-5', 'h-5');
  });

  it('lg size 클래스가 적용된다', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8');
  });

  it('기본 size는 md이다', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveClass('w-5', 'h-5');
  });
});

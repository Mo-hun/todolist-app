import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../Badge';

describe('Badge', () => {
  it('children이 렌더링된다', () => {
    render(<Badge>완료</Badge>);
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('gray color 클래스가 적용된다', () => {
    render(<Badge color="gray">기본</Badge>);
    expect(screen.getByText('기본')).toHaveClass('bg-gray-100');
  });

  it('orange color 클래스가 적용된다', () => {
    render(<Badge color="orange">진행 중</Badge>);
    expect(screen.getByText('진행 중')).toHaveClass('bg-orange-100', 'text-orange-600');
  });

  it('red color 클래스가 적용된다', () => {
    render(<Badge color="red">기한 초과</Badge>);
    expect(screen.getByText('기한 초과')).toHaveClass('bg-red-100', 'text-brand-red');
  });

  it('green color 클래스가 적용된다', () => {
    render(<Badge color="green">완료</Badge>);
    expect(screen.getByText('완료')).toHaveClass('bg-green-100', 'text-green-700');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InputField from '../InputField';

describe('InputField', () => {
  it('label이 렌더링된다', () => {
    render(<InputField label="이메일" />);
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByText('이메일')).toBeInTheDocument();
  });

  it('error 메시지가 표시된다', () => {
    render(<InputField label="이메일" error="올바른 이메일을 입력하세요" />);
    expect(screen.getByText('올바른 이메일을 입력하세요')).toBeInTheDocument();
  });

  it('error가 있을 때 border-brand-red 클래스가 적용된다', () => {
    render(<InputField label="이메일" error="오류" />);
    const input = screen.getByLabelText('이메일');
    expect(input).toHaveClass('border-brand-red');
  });

  it('placeholder가 렌더링된다', () => {
    render(<InputField label="이름" placeholder="이름을 입력하세요" />);
    expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useLoginMutation } from '@/hooks/useAuth';
import LoginPage from '../LoginPage';

const mockMutate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useLoginMutation: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
  })),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLoginMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });
  });

  it('이메일, 비밀번호 필드와 로그인 버튼이 렌더링된다', () => {
    renderPage();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('폼 제출 시 login mutate가 이메일/비밀번호와 함께 호출된다', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: '로그인' }).closest('form'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('API 에러 메시지가 있을 때 해당 메시지가 표시된다', () => {
    useLoginMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: {
        response: {
          data: { error: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' } },
        },
      },
    });

    renderPage();

    expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
  });

  it('에러 응답에 메시지가 없을 때 기본 에러 메시지가 표시된다', () => {
    useLoginMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: new Error('Network Error'),
    });

    renderPage();

    expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다')).toBeInTheDocument();
  });

  it('회원가입 링크가 존재한다', () => {
    renderPage();
    const links = screen.getAllByRole('link', { name: '회원가입' });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', '/register');
  });

  it('isPending 상태일 때 버튼이 비활성화된다', () => {
    useLoginMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    });

    renderPage();

    expect(screen.getByRole('button', { name: /로그인/ })).toBeDisabled();
  });
});

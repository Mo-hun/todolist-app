import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRegisterMutation } from '@/hooks/useAuth';
import RegisterPage from '../RegisterPage';

const mockMutate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useRegisterMutation: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
  })),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRegisterMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });
  });

  it('이메일, 비밀번호, 비밀번호 확인 필드와 회원가입 버튼이 렌더링된다', () => {
    renderPage();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
  });

  it('비밀번호가 일치하지 않을 때 클라이언트 에러 메시지가 표시되고 API 호출이 없다', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'different123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: '회원가입' }).closest('form'));

    await waitFor(() => {
    expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('비밀번호가 일치할 때 mutate가 이메일/비밀번호와 함께 호출된다', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: '회원가입' }).closest('form'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('API 에러 메시지가 있을 때 해당 메시지가 표시된다', () => {
    useRegisterMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: {
        response: {
          data: { error: { message: '이미 사용 중인 이메일입니다.' } },
        },
      },
    });

    renderPage();

    expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
  });

  it('에러 응답에 메시지가 없을 때 기본 에러 메시지가 표시된다', () => {
    useRegisterMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: new Error('Network Error'),
    });

    renderPage();

    expect(screen.getByText('이미 존재하는 이메일입니다')).toBeInTheDocument();
  });

  it('로그인 링크가 존재한다', () => {
    renderPage();
    const links = screen.getAllByRole('link', { name: '로그인' });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', '/login');
  });

  it('isPending 상태일 때 버튼이 비활성화된다', () => {
    useRegisterMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    });

    renderPage();

    expect(screen.getByRole('button', { name: /회원가입/ })).toBeDisabled();
  });
});

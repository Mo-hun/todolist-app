import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as authApi from '@/api/authApi';
import useAuthStore from '@/stores/authStore';

export function useLoginMutation() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { token, user } = response.data;
      setAuth(token, user);
      navigate('/');
    },
  });
}

export function useRegisterMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate('/login');
    },
  });
}

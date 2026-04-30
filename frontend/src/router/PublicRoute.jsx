import { Navigate } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';

export default function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

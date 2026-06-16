import { useAuthStore } from '../store/authSlice';

export const useAuth = () => {
  const { token, user, setAuth, logout } = useAuthStore();
  return { token, user, setAuth, logout };
};
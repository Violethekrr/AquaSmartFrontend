import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authSlice';

export default function ProtectedRoute() {
  const { token } = useAuthStore();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
import React from 'react';
import { useAuthStore } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md py-3 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">AquaSmart</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};